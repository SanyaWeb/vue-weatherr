class idb {

    constructor() {
        this.default = {
            idbObject: null, // windows indexedDB object.
            idbtran: null, // windows transaction object.
            dbRequest: null, // db creation request.
            db: null, //database
            version: 1, // database version
            tables: null // collection of object store.
        };
    }

    init(options) {
        if ('indexedDB' in window) {
            return new Promise((resolve, reject) => {
                this.default.idbObject = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                this.default.idbtran = window.IDBTransaction || window.webkitIDBTransaction;
                this.default.tables = options.tables;

                let defOptions = this.default;

                let idbRequest = window.indexedDB.open(options.database, options.version); // open/create db with specific version
                idbRequest.onerror = function () {
                    console.log("Error opening database.");
                    reject();
                };

                idbRequest.onsuccess = function(e)  { // store success db object in order for curd.
                    defOptions.db = this.result;
                    defOptions.version = options.version;
                    resolve();
                };

                idbRequest.onupgradeneeded = function(event) { // creation of object store first time on version change.
                    let resultDb = event.target.result;
                    defOptions.db = resultDb;

                    let optionTables = defOptions.tables;

                    //drop unwanted tables
                    for (let i = 0; i < resultDb.objectStoreNames.length; i++) {
                        let needToDrop = true;
                        for (let j = 0; j < optionTables.length; j++) {
                            if (resultDb.objectStoreNames[i] === optionTables[j].name) {
                                needToDrop = false;
                                break;
                            }
                        }
                        if (needToDrop) {
                            defOptions.db.deleteObjectStore(resultDb.objectStoreNames[i]);
                        }
                    }

                    //create new tables
                    for (let i = 0; i < optionTables.length; i++) {
                        if (!resultDb.objectStoreNames.contains(optionTables[i].name)) {
                            let objectStore = resultDb.createObjectStore(optionTables[i].name, { keyPath: optionTables[i].keyPath, autoIncrement: optionTables[i].autoIncrement });
                            console.log(optionTables[i].name + " Created.");
                            if (optionTables[i].index != null && optionTables[i].index !== 'undefined') {
                                for (let idx = 0; idx < optionTables[i].index.length; idx++) {
                                    objectStore.createIndex(optionTables[i].index[idx].name, optionTables[i].index[idx].name, { unique: optionTables[i].index[idx].unique });
                                }
                            }
                        }
                    }
                    resolve();
                };
            });
        }
        else {
            console.log("This browser doesn't support IndexedDB");
        }
    }

    tableExist(table) {
        let tables = this.default.tables;
        let isTableExists = false;
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].name === table) {
                isTableExists = true;
                break;
            }
        }
        return isTableExists;
    }

    insert (table, data, callback = null) {

        if (!this.tableExist(table)) {
            if (callback && typeof (callback) === "function") {
                callback(false, table + " Table not found.");
            }
        } else {
            let db = this.default.db;
            let tx = db.transaction(table, "readwrite");
            let store = tx.objectStore(table);

            let dataLength = 1;
            if (data.constructor === Array) {
                dataLength = data.length;
                for (let i = 0; i < dataLength; i++) {
                    store.put(data[i]);
                }
            }
            else {
                store.put(data);
            }

            tx.oncomplete = function () {
                if (callback && typeof (callback) === "function") {
                    callback(true, "" + dataLength + " records inserted.");
                }
            };

        }
    }

    delete (table, key, callback) {
        return new Promise((resolve, reject) => {
            if (!this.tableExist(table)) {
                if (callback && typeof (callback) === "function") {
                    callback(false, table + " Table not found.");
                }
            } else {
                let db = this.default.db;
                let tx = db.transaction(table, "readwrite");
                let store = tx.objectStore(table);

                let keyLength = -1;
                if (key && typeof (key) === "function") {
                    store.clear();
                } else {
                    if (key.constructor === Array) {
                        keyLength = key.length;
                        for (let i = 0; i < keyLength; i++) {
                            store.delete(key[i]);
                        }
                    } else {
                        keyLength = 1;
                        store.delete(key);
                    }
                }

                tx.oncomplete = function (event) {
                    //if all argument available
                    if (callback && typeof (callback) === "function") {
                        callback(true, "" + keyLength === -1 ? "All" : keyLength + " records deleted.");
                    }

                    //if only two argument available
                    if (key && typeof (key) === "function") {
                        key(true, "" + (keyLength === -1 ? "All" : keyLength) + " records deleted.");
                    }
                    resolve();
                };

                tx.onerror = function () {
                    if (callback && typeof (callback) === "function") {
                        callback(false, tx.error);
                    }
                    reject();
                };
            }
        });
    }

    select (table, key, callback) {
        return new Promise((resolve, reject) => {
            if (!this.tableExist(table)) {
                if (callback && typeof (callback) === "function") {
                    callback(false, table + " Table not found.");
                }
            } else {
                let db = this.default.db;
                let tx = db.transaction([table], "readonly");
                let store = tx.objectStore(table);
                let request;
                let keyLength = -1;

                if (key && typeof (key) === "function") {
                    request = store.getAll();
                } else if (key.constructor === Array) {
                    keyLength = key.length;
                    request = store.getAll();
                } else if (key && typeof key === 'object' && key.constructor === Object) {
                    keyLength = 1;
                    let index = store.index(key.key);
                    request = index.getAll(key.value);
                } else {
                    keyLength = 1;
                    request = store.get(key);
                }

                tx.oncomplete = function (event) {
                    //if all argument available
                    let result = request.result;
                    let keypath = request.source.keyPath;
                    let filteredResult = [];

                    //if need to filter key array
                    if (keyLength > 1) {
                        for (let i = 0; i < result.length; i++) {
                            for (let j = 0; j < keyLength; j++) {
                                if (result[i][keypath] === key[j]) {
                                    filteredResult.push(result[i]);
                                    break;
                                }
                            }
                        }
                        result = filteredResult;
                    }

                    if (callback && typeof (callback) === "function") {
                        callback(true, result);

                    }

                    //if only two argument available
                    if (key && typeof (key) === "function") {
                        key(true, request.result);
                    }
                    resolve();
                };
                tx.onerror = function () {
                    if (callback && typeof (callback) === "function") {
                        callback(false, request.error);
                    }
                    reject();
                };
            }
        });
    }

}

export default idb;