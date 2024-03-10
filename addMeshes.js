import {
	BoxGeometry,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	Mesh,
	TextureLoader,
} from 'three'

const loader = new TextureLoader()

export const addBoilerPlateMeshes = () => {
	const box = new BoxGeometry(1, 1, 1)
	const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 })
	const boxMesh = new Mesh(box, boxMaterial)
	boxMesh.position.set(-2, 0, 0)
	return boxMesh
}

export const addStandardMesh = () => {
	const box = new BoxGeometry(1, 1, 1)
	const boxMaterial = new MeshStandardMaterial({ color: 0x00ff00 })
	const boxMesh = new Mesh(box, boxMaterial)
	boxMesh.position.set(2, 0, 0)
	return boxMesh
}

export const addPhongMesh = () => {
	const box = new BoxGeometry(1, 1, 1)
	const boxMaterial = new MeshPhongMaterial({ color: 0xffffff })
	const boxMesh = new Mesh(box, boxMaterial)
	boxMesh.position.set(2, 0, 0)
	return boxMesh
}