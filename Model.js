import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import {
	Color,
	AnimationMixer,
	PointsMaterial,
	Points,
	MeshMatcapMaterial,
	TextureLoader,
	Vector3,
	BufferGeometry,
	Float32BufferAttribute,
	AdditiveBlending,
	Euler //for rotations
} from 'three'

export default class Model {
	constructor(obj) {
		this.name = obj.name
		this.meshes = obj.meshes
		this.file = obj.url
		this.scene = obj.scene
		this.loader = new GLTFLoader()
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('./draco/')
		this.loader.setDRACOLoader(this.dracoLoader)
		this.textureLoader = new TextureLoader()
		this.animations = obj.animationState || false
		this.replaceMaterials = obj.replace || false
		this.defaultMatcap = obj.replaceURL
			? this.textureLoader.load(`${obj.replaceURL}`)
			: this.textureLoader.load('/mat.png')
		this.mixer = null
		this.mixers = obj.mixers
		this.defaultParticle = obj.particleURL
			? this.textureLoader.load(`${obj.particleURL}`)
			: this.textureLoader.load('/10.png')
		this.scale = obj.scale || new Vector3(1, 1, 1)
		this.position = obj.position || new Vector3(0, 0, 0)
		this.rotation = obj.rotation || new Euler(0, 0, 0); // default for no rotation
	}

	init() {
		this.loader.load(this.file, (gltf) => {
			this.mesh = gltf.scene.children[0];
			if (this.replaceMaterials) {
				const replacementMaterial = new MeshMatcapMaterial({
					matcap: this.defaultMatcap,
				});
				gltf.scene.traverse((child) => {
					if (child.isMesh) {
						child.material = replacementMaterial;
					}
				});
			}
			if (this.animations) {
				this.mixer = new AnimationMixer(gltf.scene);
				gltf.animations.forEach((clip) => {
					this.mixer.clipAction(clip).play();
				});
				this.mixers.push(this.mixer);
			}
			this.meshes[`${this.name}`] = gltf.scene;
			this.meshes[`${this.name}`].position.set(this.position.x, this.position.y, this.position.z);
			this.meshes[`${this.name}`].scale.set(this.scale.x, this.scale.y, this.scale.z);

			// console.log(this.meshes[`${this.name}`])

			// hide/move turntable speakers
			if (this.name === 'turntable') {
				// let childrenToHide = [1, 2]; 
				// this.meshes[`${this.name}`].children[0]?.children.forEach((child, index) => {
				// 	if (childrenToHide.includes(index)) {
				// 		child.visible = false;
				// 	}
				// });

				this.meshes[`${this.name}`].children[0].children[1].position.set(-0.4, -0.19, -0.45)
				this.meshes[`${this.name}`].children[0].children[1].rotation.set(51, 25, 0.1)

				this.meshes[`${this.name}`].children[0].children[2].position.set(0, -0.1, .25)
				this.meshes[`${this.name}`].children[0].children[2].rotation.set(1.5, 0, 0)
			}

			if (this.name === 'plant1') {
				// names of the children to hide
				// let childrenToHide = ['Palm_01', 'Palm02', 'Palm_03', 'SnakePlant_01', 'SnakePlant_02', 'SnakePlant_03', 'Epipremium001'];

				let childrenToHide = ['Palm_01', 'Palm_03', 'SnakePlant_01', 'SnakePlant_02', 'SnakePlant_03', 'Epipremium001'];
			

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}

			if (this.name === 'plant2') {

				let childrenToHide = ['Palm_01', 'Palm02', 'Palm_03', 'SnakePlant_02', 'SnakePlant_03', 'Epipremium001'];
			

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}

			if (this.name === 'plant3') {
				// names of the children to hide
				let childrenToHide = ['Palm_01', 'Palm02', 'Palm_03', 'SnakePlant_01', 'SnakePlant_02', 'SnakePlant_03'];	

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}

			if (this.name === 'plant4') {
				// names of the children to hide
				let childrenToHide = ['Palm_01', 'Palm02', 'SnakePlant_01', 'SnakePlant_02', 'SnakePlant_03', 'Epipremium001'];	

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}

			if (this.name === 'plant5') {
				// names of the children to hide
				let childrenToHide = ['Palm_01', 'Palm02', 'Palm_03', 'SnakePlant_01', 'SnakePlant_03', 'Epipremium001'];

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}

			// if (this.name === 'couch') {
			// 	// names of the children to hide
			// 	let childrenToHide = ['Plane', 'Plane001'];	

			// 	this.meshes[`${this.name}`].children.forEach((child) => {
			// 		if (childrenToHide.includes(child.name)) {
			// 			child.visible = false;
			// 		}
			// 	});

			// 	// console.log(this.meshes[`${this.name}`]);
			// }

			if (this.name === 'donutBoy') {
				// names of the children to hide
				let childrenToHide = ['pPlane1'];	

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				console.log(this.meshes[`${this.name}`]);
			}

			if (this.name === 'rug') {
				// names of the children to hide
				let childrenToHide = ['Plane', 'Plane001', 'Plane003', 'Plane004' ];	

				this.meshes[`${this.name}`].children.forEach((child) => {
					if (childrenToHide.includes(child.name)) {
						child.visible = false;
					}
				});

				// console.log(this.meshes[`${this.name}`]);
			}
			
			

			this.scene.add(this.meshes[`${this.name}`]);

			// Euler rotation
			this.meshes[`${this.name}`].rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
		});
	}

	initPoints() {
		this.loader.load(this.file, (gltf) => {
			gltf.scene.traverse((child) => {
				if (child.isMesh) {
					this.mesh = child
				}
			})
			const palette = [
				new Color('#FAAD80'),
				new Color('#FF6767'),
				new Color('#FF3D68'),
				new Color('#A73489'),
			]

			const sampler = new MeshSurfaceSampler(this.mesh).build()
			const numParticles = 3000
			const particlesPosition = new Float32Array(numParticles * 3)
			const particleColors = new Float32Array(numParticles * 3)
			const newPosition = new Vector3()
			for (let i = 0; i < numParticles; i++) {
				sampler.sample(newPosition)
				const color =
					palette[Math.floor(Math.random() * palette.length)]
				particleColors.set([color.r, color.g, color.b], i * 3)
				particlesPosition.set(
					[newPosition.x, newPosition.y, newPosition.z],
					i * 3
				)
			}
			const pointsGeometry = new BufferGeometry()
			pointsGeometry.setAttribute(
				'position',
				new Float32BufferAttribute(particlesPosition, 3)
			)
			pointsGeometry.setAttribute(
				'color',
				new Float32BufferAttribute(particleColors, 3)
			)
			const pointsMaterial = new PointsMaterial({
				vertexColors: true,
				transparent: true,
				alphaMap: this.defaultParticle,
				alphaTest: 0.001,
				depthWrite: false,
				blending: AdditiveBlending,
				size: 0.3,
			})
			const points = new Points(pointsGeometry, pointsMaterial)
			this.meshes[`${this.name}`] = points
			this.meshes[`${this.name}`].scale.set(
				this.scale.x,
				this.scale.y,
				this.scale.z
			)
			this.meshes[`${this.name}`].position.set(
				this.position.x,
				this.position.y,
				this.position.z
			)
			this.scene.add(this.meshes[`${this.name}`])
		})
	}
}
