(function (global) {

    var DB_NAME = 'HNSO-DB',
        GESTURES_STORE_NAME = 'gestures',
        db;
    
    global.DB = {
        init: function () {
            var dfd = new $.Deferred(),
                request = window.indexedDB.open(DB_NAME, 1),
                model = this;

            function safeFallback(db) {
                db.onversionchange = function (e) {
                    db.close();
                };
            }

            request.onsuccess = function () {
                //DB exists and was opened successfully
                db = this.result;
                safeFallback(this.result);
                dfd.resolve();
            };

            request.onerror = function () {
                //error durin DB opening/creation
                dfd.reject();
            };

            request.onupgradeneeded = function (e) {
                var store, userStore;

                db = this.result;

                model.clear();

                store = db.createObjectStore(GESTURES_STORE_NAME, { keyPath: 'id', autoIncrement: true });

                store.createIndex("by_name", "name", { unique: true });

                store.transaction.onerror = function (e) {
                    dfd.reject();
                };
            };

            return dfd;
        },

        getGesture: function (gestureName) {
            var dfd = new $.Deferred(),
                gestureRequest;

            gestureRequest = db.transaction(GESTURES_STORE_NAME, "readonly")
                .objectStore(GESTURES_STORE_NAME).index("by_name").get(gestureName);

            gestureRequest.onerror = function (e) {
                dfd.reject();
            };

            gestureRequest.onsuccess = function (e) {
                dfd.resolve(e.target.result);
            };

            return dfd;
        },

        getAllGestures: function () {
            var dfd = new $.Deferred(),
                gestures = [],
                objectCursor;

            objectCursor = db.transaction(GESTURES_STORE_NAME, "readonly")
                .objectStore(GESTURES_STORE_NAME).openCursor();

            objectCursor.onsuccess = function (e) {
                var cursor = e.target.result,
                    gesture;

                if (cursor) {
                    gesture = cursor.value;
                    gestures.push(gesture);
                    cursor.continue();
                } else {
                    dfd.resolve(gestures);
                }
            };

            objectCursor.onerror = function () {
                dfd.reject(gestures);
            };

            return dfd;
        },

        addGesture: function (name, gestureJson) {
            var gestureStore = db.transaction(GESTURES_STORE_NAME, "readwrite")
                    .objectStore(GESTURES_STORE_NAME),
                gesture = { name: name, json: gestureJson },
                dfd = new $.Deferred();

            gestureStore.add(gesture);

            gestureStore.transaction.oncomplete = function (e) {
                dfd.resolve(gesture);
            };
            gestureStore.transaction.onerror = function () {
                dfd.reject();
            };

            return dfd;
        },

        removeGesture: function (gestureName) {
            var dfd = new $.Deferred();

            if (!gestureName) {
                return dfd.reject();
            }

            this.getGesture(gestureName).then(function (gesture) {
                var req = db.transaction(GESTURES_STORE_NAME, "readwrite")
                    .objectStore(GESTURES_STORE_NAME)
                    .delete(gesture.id);
                
                req.onsuccess = function(evt) {
                    dfd.resolve();
                };
                req.onerror = function (evt) {
                    dfd.reject();
                };
            });
            

            return dfd;
        },

        clear: function (stores) {
            if (!db) {
                return;
            }

            _.forEach(stores || db.objectStoreNames, function (storeName) {
                if (_.contains(db.objectStoreNames, storeName)) {
                    db.deleteObjectStore(storeName);
                }
            });
        },

        delete: function () {
            var dfd = new $.Deferred(),
                request;

            if (db) {
                db.close();
            }
            
            request = window.indexedDB.deleteDatabase(DB_NAME);

            request.onsuccess = dfd.resolve;
            request.onerror = dfd.reject;

            return dfd;
        }
    };

})(window);