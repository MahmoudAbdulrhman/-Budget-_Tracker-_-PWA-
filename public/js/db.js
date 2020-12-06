
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending",{
    keyPath: "id",
    autoIncrement: true
}); 
};

request.onerror = (err) => {
    console.log(err.message);
};

request.onsuccess = (event)=>{
    db = event.target.result;

    if (navigator.onLine){
        checkDatabase();
    }
};

function saveRecord(record){
    const transaction = db.transaction("pending", "readwrite");
    const store = transaction.createObjectStore("pending");
    store.add(record);
}

function checkDatabase(){
    const transaction = db.transaction("pending","readonly");
    const store = transaction.createObjectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0){
            fetch("/api/transaction/bulk",{
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then((response)=> response.json())
            .then(()=> {
                const transaction = db.transaction("pending","readwrite");
                const store = transaction.createObjectStore("pending");
                store.clear();
            })
        }
    };
}


window.addEventListener("online", checkDatabase);