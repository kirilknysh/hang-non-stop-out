(function (global, LeapTrainer, Leap) {
    
    global.leapController = global.leapController || new Leap.Controller();

    var HNSOControllerClass = LeapTrainer.CorrelationController.extend({
        controller: leapController,
        trainingCountdown: 5,
        trainingGestures: 1,//amount of repetition
        minPoseFrames: 75,
        hitThreshold: 0.6,

        remove: function (gestureName) {
            if (this.gestures[gestureName]) {
                delete this.gestures[gestureName];
            }
            if (this.poses.hasOwnProperty(gestureName)) {
                delete this.poses[gestureName];
            }

            this.fire('gesture-removed', gestureName);
        }
    });

    global.HNSOController = new HNSOControllerClass();

})(window,  LeapTrainer, Leap);