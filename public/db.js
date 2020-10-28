let db;
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  const pending = db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.error);
};

function saveRecord(record) {
  const db = request.result;
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  pendingStore.add(record);
}

function checkDatabase() {
  const db = request.result;
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  const getAll = pendingStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "applicaton/json",
        },
      }).then((response) => response.json())
        .then(() => {
          const db = request.result;
          const transaction = db.transaction(["pending"], "readwrite");
          pendingStore.clear();
      });
    }
  };
}


