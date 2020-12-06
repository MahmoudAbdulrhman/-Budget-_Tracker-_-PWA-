let db;
const request = indexedDB.open('budget_tracker', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        addRecord();
    }
};
request.onerror = function(event) {
    console.log(event.target.errorCode);
};
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const trackerStore = transaction.objectStore('new_transaction');
    trackerStore.add(record);
}
function addRecord() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const trackerStore = transaction.objectStore('new_transaction');
    const getAll = trackerStore.getAll();  
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const trackerStore = transaction.objectStore('new_transaction');
                    trackerStore.clear();
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}
window.addEventListener('online', addRecord);