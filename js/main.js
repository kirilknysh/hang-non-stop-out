(function (global, doc, HNSOController, VisualController, db) {
    var newGesture = {
        buttonNode: doc.getElementById('new-gesture-button'),
        textNode: doc.getElementById('new-text-value')
    },
    canvasContainer = doc.getElementById('visualizer'),
    canvasClass = 'visual-canvas',
    overlay, list, iterator;

    db.init().always(function () {
        db.getAllGestures().always(function(predefinedGestures) {
            initAdding();
            overlay = initOverlay();
            list = initList();
            canvasContainer.style.height = (window.innerHeight - 325) + 'px';
            VisualController.init(canvasContainer, canvasClass);
            global.leapController.connect();

            for (iterator = 0; iterator < predefinedGestures.length; iterator++) {
                HNSOController.fromJSON(predefinedGestures[iterator].json);
                list.add(predefinedGestures[iterator].name);
            }
        });
    });

    function initAdding() {
        newGesture.buttonNode.addEventListener('click', function (event) {
            if (newGesture.textNode.value) {
                newGesture.textNode.classList.remove('error');
                startNewGestureTraining(newGesture.textNode.value);
            } else {
                newGesture.textNode.classList.add('error');
            }
        }, false);

        HNSOController.on('training-countdown', function (countdown) {
            overlay.content(countdown);
        });
        HNSOController.on('training-started', function (gestureName) {
            overlay.showVisualizer("Start your gesture");
        });
        HNSOController.on('training-complete', function (gestureName, trainingSkipped) {
            overlay.show('Gesture ' + gestureName + ' has been created');
            list.add(gestureName);
            db.addGesture(gestureName, HNSOController.toJSON(gestureName));
            setTimeout(function () {
                overlay.hide();
                newGesture.textNode.value = '';
            }, 3000);
        });
        HNSOController.on('gesture-recognized', function (gestureName) {
            console.log('gesture-recognized');
        });
    }

    function initOverlay() {
        var overlayNode = doc.getElementById('overlay'),
            overlayContent = doc.getElementById('overlay-content');

        return {
            show: function (content) {
                overlayNode.classList.add('visible');
                overlayNode.classList.remove('visible-visualizer');

                if (content) {
                    this.content(content);
                }
            },
            showVisualizer: function () {
                this.show.apply(this, arguments);

                overlayNode.classList.add('visible-visualizer');
            },
            hide: function () {
                overlayNode.classList.remove('visible-visualizer');
                overlayNode.classList.remove('visible');
            },
            content: function (content) {
                overlayContent.innerHTML = content;
            }
        };
    }

    function initList() {
        var listNode = doc.getElementById('list'),
            baseItem = doc.createElement('li'),
            textNode = doc.createElement('span'),
            trashIcon = doc.createElement('span');

        baseItem.classList.add('item');
        textNode.classList.add('text');
        trashIcon.classList.add('trash');
        baseItem.appendChild(trashIcon);
        baseItem.appendChild(textNode);

        listNode.addEventListener('click', function (event) {
            var itemNode, gestureName;

            if (event.target.classList.contains('trash')) {
                itemNode = event.target.parentNode;
                gestureName = itemNode.dataset.getureName;
                HNSOController.remove(gestureName);
                list.remove(itemNode);
                db.removeGesture(gestureName);
            }
        });

        return {
            add: function (item) {
                listNode.appendChild(this.createItem(item));
            },
            remove: function (itemNode) {
                listNode.removeChild(itemNode);
            },
            removeByIndex: function (index) {
                if (listNode.childNodes[index]) {
                    listNode.removeChild(listNode.childNodes[index]);
                }
            },
            clear: function () {
                while (listNode.firstChild) {
                    listNode.removeChild(listNode.firstChild);
                }
            },
            createItem: function(item) {
                var node = baseItem.cloneNode(true),
                    textNode = node.querySelector('.text');

                textNode.innerText = item;
                node.dataset.getureName = item;

                return node;
            }
        };
    }

    function startNewGestureTraining(name) {
        overlay.show("Get ready...");

        setTimeout(function() {
            HNSOController.create(name);
        }, 2000);
    }
})(window, document, window.HNSOController, window.VisualController, window.DB);