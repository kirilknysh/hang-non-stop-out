(function (global, LeapTrainer, Leap) {
    
    global.leapController = global.leapController || new Leap.Controller();

    global.HNSOController = new LeapTrainer.ANNController({
        controller: leapController,
        trainingCountdown: 5,
        trainingGestures: 1,//amount of repetition
        minPoseFrames: 40,
        hitThreshold: 0.6
    });

})(window,  LeapTrainer, Leap)