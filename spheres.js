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

// function resetPositions() {
//     positions = [
//         { color: 'blue', x: -.5, y: 3, z: -0.1, name: 'blue1' },
//         { color: 'blue', x: 7, y: 2.8, z: -0.1, name: 'blue2' },
//         { color: 'blue', x: 5.5, y: 1.4, z: -0.1, name: 'blue3' },
//         { color: 'blue', x: -.5, y: -.4, z: -0.1, name: 'blue4' },
//         { color: 'blue', x: 2, y: -2, z: -0.1, name: 'blue5' },
//         { color: 'blue', x: 8, y: -0.24, z: -0.1, name: 'blue6' },
//         { color: 'blue', x: 5.5, y: -3.5, z: -0.1, name: 'blue7' },
//         { color: 'blue', x: 7.3, y: -1.65, z: -0.1, name: 'blue8' },
//         { color: 'black', x: 2, y: 2.3, z: -0.1, name: 'black1' },
//         { color: 'black', x: 6, y: -0.24, z: -0.1, name: 'black2' },
//         { color: 'black', x: -.7, y: -4, z: -0.1, name: 'black3' },
//         { color: 'black', x: 3, y: -3.5, z: -0.1, name: 'black4' },
//         { color: 'white', x: 4.5, y: 3.6, z: -0.1, name: 'white1' },
//         { color: 'white', x: .50, y: 1, z: -0.1, name: 'white2' },
//         { color: 'white', x: 3, y: 1, z: -0.1, name: 'white3' },
//         { color: 'white', x: 7.8, y: -3.1, z: -0.1, name: 'white4' },
//     ];

//     return positions;
// }

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
		resetPositions();
    });

}

setupButtonListeners();