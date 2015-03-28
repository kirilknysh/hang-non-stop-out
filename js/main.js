(function (global, doc, HNSOController, VisualController, db, gapi, gadgets) {
    var newGesture = {
        buttonNode: doc.getElementById('new-gesture-button'),
        textNode: doc.getElementById('new-text-value')
    },
    canvasContainer = doc.getElementById('visualizer'),
    canvasClass = 'visual-canvas',
    overlay, list, iterator, audioRequested = false;

    gadgets = gadgets || { util: { registerOnLoadHandler: function(cb) { cb(); } } };
    if (!gapi) {
        gapi = {};
    }
    if (!gapi.hangout) {
        gapi.hangout = {};
    }
    if (!gapi.hangout.av) {
        gapi.hangout.av = {};
    }
    if (!gapi.hangout.av.effects) {
        gapi.hangout.av.effects = {};
    }
    if (!gapi.hangout.av.effects.createAudioResource) {
        gapi.hangout.av.effects.createAudioResource = function () {
            return {
                onLoad: {
                    add: function (cb) { cb({ isLoaded: true }); },
                    remove: function () { }
                },
                play: function () {
                    return {
                        stop: function () { },
                        dispose: function () { }
                    };
                },
                dispose: function () {}
            };
        };
    }
    if (!gapi.hangout.onApiReady) {
        gapi.hangout.onApiReady = {};
    }
    if (!gapi.hangout.onApiReady.add) {
        gapi.hangout.onApiReady.add = function (cb) { cb({ isApiReady: true }); };
    }

    gadgets.util.registerOnLoadHandler(function () {
        gapi.hangout.onApiReady.add(function (eventObj) {
            if (!eventObj.isApiReady) {
                return;
            }

            db.init().always(function () {
                db.getAllGestures().always(function(predefinedGestures) {
                    initAdding();
                    initRecognition();
                    overlay = initOverlay();
                    list = initList();
                    canvasContainer.style.height = (window.innerHeight - 325) + 'px';
                    VisualController.init(canvasContainer, canvasClass);

                    var crosshair = doc.createElement('div');
                    crosshair.className = 'crosshair';
                    var visualizer = doc.getElementById('visualizer');
                    visualizer.appendChild(crosshair);

                    global.leapController.connect();

                    for (iterator = 0; iterator < predefinedGestures.length; iterator++) {
                        HNSOController.fromJSON(predefinedGestures[iterator].json);
                        list.add(predefinedGestures[iterator].name);
                    }
                });
            });
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
    }

    function initRecognition() {
        HNSOController.on('gesture-recognized', function (prob, gestureName) {

            if (audioRequested) { return console.log('Audio already requested'); }

            console.log('recognized ' + prob + ' name ' + gestureName);
            list.highlight(gestureName);
            playGesture(gestureName);
        });
    }

    function playGesture(gestureName) {
        var url = generateUrlForGesture(gestureName),
            audioResource = gapi.hangout.av.effects.createAudioResource(url);

        audioRequested = true;

        audioResource.onLoad.add(function __onAudioResouceLoaded__(loadResult) {
            var sound;

            audioRequested = false;

            audioResource.onLoad.remove(__onAudioResouceLoaded__);
            if (loadResult.isLoaded) {
                console.log('name ' + gestureName + " url " + url);
                sound = audioResource.play({localOnly: false, loop: false, volume: 0.9});
                setTimeout(function () {
                    sound.stop();
                    sound.dispose();
                    audioResource.dispose();
                }, 7000);
            }
        });
    }

    function generateUrlForGesture(gestureName) {
        var url = 'https://tts.voicetech.yandex.net/generate?',
            params = [
                'text=' + encodeURIComponent(gestureName),
                'format=wav',
                'lang=ru-RU',
                'speaker=zahar',
                'emotion=good',
                'key=1e0195fd-c2d7-484f-aa71-8dd37733c205'
            ];

        return url + params.join('&');
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
                node.dataset.gestureName = item;

                return node;
            },
            highlight: function (gestureName) {
                var selected = listNode.querySelector('.selected'),
                    target, iterator;

                if (selected) {
                    selected.classList.remove('selected');
                }

                for (iterator = 0; iterator < listNode.childNodes.length; iterator++) {
                    if (listNode.childNodes[iterator].dataset.gestureName &&
                        listNode.childNodes[iterator].dataset.gestureName === gestureName) {
                        target = listNode.childNodes[iterator];
                    }
                }

                if (target) {
                    target.classList.add('selected');
                }
            }
        };
    }

    function startNewGestureTraining(name) {
        overlay.show("Get ready...");

        setTimeout(function() {
            HNSOController.create(name);
        }, 2000);
    }
})(window, document, window.HNSOController, window.VisualController, window.DB, window.gapi, window.gadgets);
