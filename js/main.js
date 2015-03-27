(function (global, doc, HNSOController, VisualController) {
    var newGesture = {
        buttonNode: doc.getElementById('new-gesture-button'),
        textNode: doc.getElementById('new-text-value')
    },
    canvasContainer = doc.getElementById('overlay'),
    canvasClass = 'content',
    overlay, list, iterator, predefinedGestures;

    initAdding();
    overlay = initOverlay();
    list = initList();
    VisualController.init(canvasContainer, canvasClass);
    global.leapController.connect();

    predefinedGestures = Object.keys(HNSOController.gestures);
    for (iterator = 0; iterator < predefinedGestures.length; iterator++) {
        list.add(predefinedGestures[iterator]);
    }

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
            setTimeout(function () {
                overlay.hide();
            }, 4000);
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

        return {
            add: function (item) {
                listNode.appendChild(this.createItem(item));
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
})(window, document, window.HNSOController, window.VisualController);