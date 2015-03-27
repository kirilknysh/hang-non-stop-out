(function (global, Leap) {
	global.VisualController = global.VisualController || {};

	VisualController.init = function initVisualController (canvasContainer, canvasClass) {
		var scene = new THREE.Scene(),
	    	pointLight = new THREE.PointLight(0xFFffff),
	    	camera = new THREE.PerspectiveCamera(45, global.innerWidth / global.innerHeight, 1, 1000),
	    	renderer = new THREE.WebGLRenderer({
	    	    alpha: true
		    });
	    
	    pointLight.position = new THREE.Vector3(-20, 10, 0);
	    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
	    scene.add(pointLight);
	    camera.position.fromArray([0, 6, 30]);
	    camera.lookAt(new THREE.Vector3(0, 0, 0));

	    renderer.setClearColor(0x000000, 0);
	    renderer.setSize(global.innerWidth, global.innerHeight);

	    if (canvasClass) {
	    	var canvasClass = document.createAttribute('class');
	    	canvasClass.value = canvasClass;
	    	renderer.domElement.attributes.setNamedItem(canvasClass);
	    }

	    if(!canvasContainer) {
	    	return console.log("ERROR! canvasContainer is undefined");
	    }	    
	    
	    canvasContainer.appendChild(renderer.domElement);

	    global.addEventListener('resize', function() {
	        camera.aspect = global.innerWidth / global.innerHeight;
	        camera.updateProjectionMatrix();
	        renderer.setSize(global.innerWidth, global.innerHeight);
	        return renderer.render(scene, camera);
	    }, false);

	    scene.add(camera);
	    renderer.render(scene, camera);

	    global.leapController = global.leapController || new Leap.Controller();

		global.leapController
			.use('riggedHand', {
				parent: scene,
				scene: scene,
	    		renderer: renderer,
	    		camera: camera,
				checkWebGL: true
			});
	};

})(window, Leap)