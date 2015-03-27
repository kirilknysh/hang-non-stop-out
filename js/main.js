(function (global, doc, HNSOController) {
    var newGesture = {
        buttonNode: doc.getElementById('new-gesture-button'),
        textNode: doc.getElementById('new-text-value')
    },
    overlay;

    initAdding();
    overlay = initOverlay();

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
            overlay.content("Start your gesture");
        });
        HNSOController.on('training-complete', function (gestureName, trainingSkipped) {
            overlay.content('Gesture ' + gestureName + ' has been crated');
            setTimeout(function () {
                overlay.hide();
            }, 2000);
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

                if (content) {
                    this.content(content);
                }
            },
            hide: function () {
                overlayNode.classList.remove('visible');
            },
            content: function (content) {
                overlayContent.innerHTML = content;
            }
        };
    }

    function startNewGestureTraining(name) {
        overlay.show("Get ready...");

        setTimeout(function() {
            HNSOController.create(name);
        }, 2000);
    }
})(window, document, window.HNSOController);