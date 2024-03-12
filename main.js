import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMeshes, addStandardMesh } from './addMeshes'
import { addLight } from './addLights'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import Model from './Model'
import { Euler } from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
)
const clock = new THREE.Clock()
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
const scene = new THREE.Scene()

const loader = new THREE.TextureLoader();
loader.load('/wood.jpg', function (texture) {
	scene.background = texture;
});

const meshes = {}
const lights = {}
const mixers = [];

const boxGeometry = new THREE.BoxGeometry(3.1, 3.1, 0.05);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide, shininess: 0, emissive: 0xe0e0e0, });
const wall = new THREE.Mesh(boxGeometry, wallMaterial);
wall.position.z = -0.2;
wall.name = "coverBase"
scene.add(wall);
meshes.coverBase = wall;

const sphereRadius = 0.20;
const sphereDetail = 32;
const colors = {
	blue: 0x5283a4,
	black: 0x000000,
	white: 0xf8f8ff
};

const spiralMatcapLoader = new THREE.TextureLoader();
const spiralMatcapTexture = spiralMatcapLoader.load('/spiral2.jpg');

let analyser
let isAudioPlaying = false

// sphere positions
const positions = [

	{ color: 'blue', x: -.5, y: 3, z: -0.1, name: 'blue1' },
	{ color: 'blue', x: 7, y: 2.8, z: -0.1, name: 'blue2' },
	{ color: 'blue', x: 5.5, y: 1.4, z: -0.1, name: 'blue3' },
	{ color: 'blue', x: -.5, y: -.4, z: -0.1, name: 'blue4' },
	{ color: 'blue', x: 2, y: -2, z: -0.1, name: 'blue5' },
	{ color: 'blue', x: 8, y: -0.24, z: -0.1, name: 'blue6' },
	{ color: 'blue', x: 5.5, y: -3.5, z: -0.1, name: 'blue7' },
	{ color: 'blue', x: 7.3, y: -1.65, z: -0.1, name: 'blue8' },

	{ color: 'black', x: 2, y: 2.3, z: -0.1, name: 'black1' },
	{ color: 'black', x: 6, y: -0.24, z: -0.1, name: 'black2' },
	{ color: 'black', x: -.7, y: -4, z: -0.1, name: 'black3' },
	{ color: 'black', x: 3, y: -3.5, z: -0.1, name: 'black4' },

	{ color: 'white', x: 4.5, y: 3.6, z: -0.1, name: 'white1' },
	{ color: 'white', x: .50, y: 1, z: -0.1, name: 'white2' },
	{ color: 'white', x: 3, y: 1, z: -0.1, name: 'white3' },
	{ color: 'white', x: 7.8, y: -3.1, z: -0.1, name: 'white4' },

];

//spheres
positions.forEach(({ color, x, y, z, name }) => {
	const geometry = new THREE.SphereGeometry(sphereRadius, sphereDetail, sphereDetail);
	const material = color === 'white' ? new THREE.MeshMatcapMaterial({ matcap: spiralMatcapTexture }) : new THREE.MeshBasicMaterial({ color: colors[color], side: THREE.DoubleSide });
	const sphere = new THREE.Mesh(geometry, material);
	if (name) {
		meshes[`${name}`] = sphere
	}

	// center at the origin
	sphere.position.set(x * 0.25 - 0.875, y * 0.25 - 0.125, 0);
	scene.add(sphere);
});

// load floor texture
const floorTextureLoader = new THREE.TextureLoader();
floorTextureLoader.load('/floor2.jpg', function (texture) {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(10, 10);

	// create floor geometry and material
	const floorGeometry = new THREE.PlaneGeometry(20, 20);
	const floorMaterial = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
	});

	// create the floor mesh and add it to the scene
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2; // rotate to make it horizontal
	floor.position.y = -3.5;
	scene.add(floor);
});



// back wall
const backWallTextureLoader = new THREE.TextureLoader();
backWallTextureLoader.load('/wallpaper2.jpg', function (texture) {

	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(8, 4);

	const backWallMaterial = new THREE.MeshBasicMaterial({
		map: texture,
		side: THREE.DoubleSide
	});

	const backWallGeometry = new THREE.PlaneGeometry(20, 10);

	const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);

	backWall.position.y = 1.5;
	backWall.position.z = -10;

	scene.add(backWall);
});

// right wall

backWallTextureLoader.load('/wallpaper2.jpg', function (texture) {
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(8, 4);

	const rightWallMaterial = new THREE.MeshBasicMaterial({
		map: texture,
		side: THREE.DoubleSide
	});

	const rightWallGeometry = new THREE.PlaneGeometry(20, 10);

	const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);

	// position and rotate the right wall to make it the right side of the scene
	rightWall.position.set(10, 1.5, -0);
	rightWall.rotation.y = -Math.PI / 2;

	scene.add(rightWall);
});

camera.position.z = 3;

//zoom variables
let targetPosition = new THREE.Vector3(2, 3, 8);
let targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
let shouldInterpolate = false;


init()

function init() {
	//set up our renderer default settings, add scene/canvas to webpage
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.getElementById('threejs-background').appendChild(renderer.domElement);


	meshes.default = addBoilerPlateMeshes()
	meshes.standard = addStandardMesh()
	lights.default = addLight()

	scene.add(lights.default)

	camera.position.set(2, 3, 8)
	instances()
	loadFonts()
	resize()
	animate()
}

function loadFonts() {
	const fontLoader = new FontLoader();
	const group = new THREE.Group();

	const tLoader = new THREE.TextureLoader();
	const mat = tLoader.load('/mat4.png');
	const fontUrl = '/dmSans700.json';

	fontLoader.load(fontUrl, (font) => {
		const texts = [
			{ text: 'PERSUASIVE   PERCUSSION', size: 0.15, height: 0.0005, position: { x: -1.35, y: 1.25, z: 0 } },
			{ text: 'VOLUME 3', size: 0.07, height: 0.0005, position: { x: -1.35, y: 1.1, z: 0 } },
			{ text: 'STEREO', size: 0.07, height: 0.0005, position: { x: 0.03, y: 1.1, z: 0 } }
		];

		texts.forEach(({ text, size, height, position }) => {
			const textGeometry = new TextGeometry(text, {
				font: font,
				size: size,
				height: height,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.03,
				bevelSize: 0.002,
				bevelOffset: 0,
				bevelSegments: 5,
			});

			const textMaterial = new THREE.MeshMatcapMaterial({
				matcap: mat,
			});

			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(position.x, position.y, position.z);

			group.add(textMesh);
		});

		scene.add(group);
		meshes.fonts = group;
	});
}

function instances() {
	const turntable = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/turntable.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		// replace: true,
		name: 'turntable',
		position: new THREE.Vector3(0, -1.5, 2),
		scale: new THREE.Vector3(6, 6, 6),
		rotation: new Euler(0, THREE.MathUtils.degToRad(25), 0)
	})

	turntable.init()

	const tulipTable = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/table.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'tulip table',
		position: new THREE.Vector3(0, -3.5, 2),
		scale: new THREE.Vector3(2, 2, 2),
	})

	tulipTable.init()

	const chair = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/eames.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'eames',
		position: new THREE.Vector3(2.5, -3.5, 2),
		scale: new THREE.Vector3(3, 3, 3),
		rotation: new Euler(0, THREE.MathUtils.degToRad(-35), 0)
	})

	chair.init()

	const orangeTable = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/orangeTable.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'orange table',
		position: new THREE.Vector3(0, -1.6, -1.5),
		scale: new THREE.Vector3(1, 1, 1),
		rotation: new Euler(0, THREE.MathUtils.degToRad(90), 0)
	})

	orangeTable.init()

	const projector = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/projector.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'projector',
		position: new THREE.Vector3(3.5, 0.25, -8.5),
		scale: new THREE.Vector3(10, 10, 10),
		rotation: new Euler(0, THREE.MathUtils.degToRad(90), 0)
	})

	projector.init()

	const cabinet = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/cabinet.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'cabinet',
		position: new THREE.Vector3(5, -3.5, -9.8),
		scale: new THREE.Vector3(4, 4, 4),
	})

	cabinet.init()

	const plant1 = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/plants.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'plant1',
		position: new THREE.Vector3(-22, -3.5, -8),
		scale: new THREE.Vector3(10, 10, 10),
	})

	plant1.init()
	const initialY = plant1.position.y;

	const plant2 = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/plants.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'plant2',
		position: new THREE.Vector3(-2.75, -1.5, -1),
		scale: new THREE.Vector3(5, 5, 5),
	})

	plant2.init()

	const plant3 = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/plants.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'plant3',
		position: new THREE.Vector3(-44, -3.5, -1),
		scale: new THREE.Vector3(8, 8, 8),
	})

	plant3.init()

	const plant4 = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/plants.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'plant4',
		position: new THREE.Vector3(-40, -3.5, 2),
		scale: new THREE.Vector3(8, 8, 8),
	})

	plant4.init()

	const plant5 = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/plants.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'plant5',
		position: new THREE.Vector3(-6.8, .25, -9),
		scale: new THREE.Vector3(5, 5, 5),
	})

	plant5.init()

	const tv = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/tv.gltf',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'tv',
		position: new THREE.Vector3(-6.5, -3.5, -8),
		scale: new THREE.Vector3(2, 2, 2),
		rotation: new Euler(0, THREE.MathUtils.degToRad(30), 0)
	})

	tv.init()

	const couch = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/couch5.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'couch',
		position: new THREE.Vector3(8, -3.45, -3),
		scale: new THREE.Vector3(1, 1, 1),
		rotation: new Euler(0, THREE.MathUtils.degToRad(-90), 0)
	})

	couch.init()

	const headphones = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/headphones.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'headphones',
		position: new THREE.Vector3(3, -1.28, 1.2),
		scale: new THREE.Vector3(.3, .3, .3),
		rotation: new Euler(0, THREE.MathUtils.degToRad(15), 0)
	})

	headphones.init()

	const rug = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/rug.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'rug',
		position: new THREE.Vector3(8, -7.33, 10),
		scale: new THREE.Vector3(3, 3, 3),
	})

	rug.init()

	const donutBoy = new Model({
		//4 mandatories
		mixers: mixers,
		url: '/donutBoy.glb',
		animationState: true,
		scene: scene,
		meshes: meshes,
		name: 'donutBoy',
		position: new THREE.Vector3(7.5, 0.3, -9),
		scale: new THREE.Vector3(15, 15, 15),
		rotation: new Euler(0, THREE.MathUtils.degToRad(130), 0)
	})

	donutBoy.init()

}

function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();

	if (shouldInterpolate) {
		const isPositionClose = camera.position.distanceTo(targetPosition) < 0.01;
		const isQuaternionClose = camera.quaternion.equals(targetQuaternion, 0.01); // Second parameter is the tolerance

		if (!isPositionClose) {
			camera.position.lerp(targetPosition, 0.05);
		}

		if (!isQuaternionClose) {
			camera.quaternion.slerp(targetQuaternion, 0.05);
		}

		// If both position and quaternion are close to their targets, stop interpolation
		if (isPositionClose && isQuaternionClose) {
			shouldInterpolate = false; // Stop interpolation
		}
	}

	renderer.render(scene, camera);


	if (analyser) {
		let avgFrq = analyser.getAverageFrequency() * 0.01;
		console.log(analyser.getAverageFrequency());

		meshes.blue1.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.blue2.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);
		meshes.blue3.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);
		meshes.blue4.scale.set(avgFrq * 1.5, avgFrq * 1.5, avgFrq * 1.5);
		meshes.blue5.scale.set(avgFrq * 1.5, avgFrq * 1.5, avgFrq * 1.5);
		meshes.blue6.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.blue7.scale.set(avgFrq * .75, avgFrq * .75, avgFrq * .75);
		meshes.blue8.scale.set(avgFrq * .75, avgFrq * .75, avgFrq * .75);

		meshes.black1.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.black2.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.black3.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);
		meshes.black4.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);

		meshes.white1.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.white2.scale.set(avgFrq, avgFrq, avgFrq);
		meshes.white3.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);
		meshes.white4.scale.set(avgFrq * 1.25, avgFrq * 1.25, avgFrq * 1.25);
	}

	if (analyser) {
		let avgFrq = analyser.getAverageFrequency() * 0.075;
		console.log(analyser.getAverageFrequency());

		meshes.blue1.position.z = avgFrq * .01;
		meshes.blue2.position.z = avgFrq * .03;
		meshes.blue3.position.z = avgFrq * .05;
		meshes.blue4.position.z = avgFrq * .01;
		meshes.blue5.position.z = avgFrq * .01;
		meshes.blue6.position.z = avgFrq * .03;
		meshes.blue7.position.z = avgFrq * .05;
		meshes.blue8.position.z = avgFrq * .07;

		meshes.black1.position.z = avgFrq * .01;
		meshes.black2.position.z = avgFrq * .03;
		meshes.black3.position.z = avgFrq * .05;
		meshes.black4.position.z = avgFrq * .01;

		meshes.white1.position.z = avgFrq * .01;
		meshes.white2.position.z = avgFrq * .01;
		meshes.white3.position.z = avgFrq * .05;
		meshes.white4.position.z = avgFrq * .03;
	}

	if (analyser) {
		let avgFrq = analyser.getAverageFrequency() * 0.005;
		console.log(analyser.getAverageFrequency());

		meshes.plant1.position.y = avgFrq - 4;
		// meshes.plant1.rotation.z = THREE.MathUtils.degToRad(avgFrq);
		meshes.plant2.rotation.x = THREE.MathUtils.degToRad(2 * avgFrq);
		// meshes.plant2.rotation.z = THREE.MathUtils.degToRad(avgFrq);
		// meshes.plant3.position.y = avgFrq - 4;
		meshes.plant3.rotation.x = THREE.MathUtils.degToRad(3 * avgFrq);

		meshes.plant4.rotation.x = THREE.MathUtils.degToRad(4 * avgFrq);
		meshes.plant5.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);

		// meshes.headphones.position.y = avgFrq - 1.4;
		meshes.headphones.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.turntable.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.coverBase.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.tv.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.donutBoy.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.projector.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);
		meshes.fonts.rotation.x = THREE.MathUtils.degToRad(5 * avgFrq);

	}
}

function logCameraPosition() {
	console.log(`Camera Position - x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`);
}

function setupButtonListeners() {
	const visualizerOpenButton = document.getElementById('visualizerOpen');
	const visualizerCloseButton = document.getElementById('visualizerClose');
	const contentDiv = document.querySelector('.content');
	const visualizerDiv = document.querySelector('.visualizer');

	const playButton = document.getElementById('playButton');
	const stopButton = document.getElementById('stopButton');

	// Create an AudioListener and add it to the camera
	const listener = new THREE.AudioListener();
	camera.add(listener);

	// Create an Audio source
	const sound = new THREE.Audio(listener);

	// Load a sound and set it as the Audio object's buffer
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('/bingobangobongobaby.ogg', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.5);
	});

	function resetPositions() {
        positions.forEach(position => {
            const object = scene.getObjectByName(position.name);
            if (object) {
                object.position.set(position.x, position.y, position.z);
            }
        });
	}

	function updateButtonVisibility() {
        if (isAudioPlaying) {
            playButton.style.display = 'none';
            stopButton.style.display = 'block';
        } else {
            playButton.style.display = 'block';
            stopButton.style.display = 'none';
        }
    }

	visualizerOpenButton.addEventListener('click', () => {
		targetPosition.set(0, 0, 3);
		targetQuaternion.setFromEuler(new THREE.Euler(0, 0, 0));
		shouldInterpolate = true;
		camera.lookAt(scene.position);

		contentDiv.classList.add('hidden');
		setTimeout(() => {
			contentDiv.style.display = 'none';
			visualizerDiv.style.display = 'flex';
			setTimeout(() => {
				visualizerDiv.style.opacity = 1;
				visualizerDiv.style.visibility = 'visible';
			}, 10); // css delay
		}, 500); // fade out

		// play the audio only if it's not already playing
		if (!isAudioPlaying) {
			sound.play();
			isAudioPlaying = true;
			analyser = new THREE.AudioAnalyser(sound, 32);
			const data = analyser.getAverageFrequency();
		}

		updateButtonVisibility();
	});

	visualizerCloseButton.addEventListener('click', () => {
		targetPosition.set(2, 3, 8);
		targetQuaternion.setFromEuler(new THREE.Euler(0, 0, 0));
		shouldInterpolate = true;
		camera.lookAt(scene.position);

		visualizerDiv.style.opacity = 0;
		visualizerDiv.style.visibility = 'hidden';
		setTimeout(() => {
			visualizerDiv.style.display = 'none';
			contentDiv.style.display = 'block';
			setTimeout(() => {
				contentDiv.classList.remove('hidden');
			}, 10);
		}, 500);

		updateButtonVisibility();
	});

    playButton.addEventListener('click', () => {
        if (!isAudioPlaying) {
            sound.play();
            isAudioPlaying = true;
            analyser = new THREE.AudioAnalyser(sound, 32);
            playButton.style.display = 'none'; 
            stopButton.style.display = 'block'; 
        }

		updateButtonVisibility();
    });

    stopButton.addEventListener('click', () => {
        if (isAudioPlaying) {
            sound.stop();
            isAudioPlaying = false;
            stopButton.style.display = 'none';
            playButton.style.display = 'block';
        }

		updateButtonVisibility();
    });

}

setupButtonListeners();


controls.addEventListener('start', function () {
	shouldInterpolate = false;
});

renderer.domElement.addEventListener('click', logCameraPosition);