import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshLambertMaterial, Mesh, SphereGeometry, TetrahedronGeometry, SpotLight} from 'three';
import {BasicScreen} from './BasicScreen.js';

class ObjectLookAtScreen extends BasicScreen {
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 20;
        this.camera.position.y = 5;
        this.camera.position.z = 13;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setClearColor(0xeeeeee, 1.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screenNode.appendChild(this.renderer.domElement);
        // create a (pointer representation) cuboid and add to scene
        const cubeGeometry = new BoxGeometry(1, 1, 7);
        const cubeMaterial = new MeshLambertMaterial({color: 'blue'});
        cubeMaterial.transparent = true;
        const pointer = new Mesh(cubeGeometry, cubeMaterial);
        pointer.name = 'pointer';
        this.scene.add(pointer);
        // create a sphere and add to scene
        const sphereGeometry = new SphereGeometry(1, 10, 10);
        const sphereMaterial = new MeshLambertMaterial({color: 'green'});
        const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(4, 6, -4);
        sphereMesh.name = 'sphere';
        this.scene.add(sphereMesh);
        // create a tetrahedron and add to scene
        const tetraGeometry = new TetrahedronGeometry(2);
        const tetraMaterial = new MeshLambertMaterial({color: 'yellow'});
        const tetraMesh = new Mesh(tetraGeometry, tetraMaterial);
        tetraMesh.position.set(-6, 0, -4);
        tetraMesh.name = 'tetrahedron';
        this.scene.add(tetraMesh);
        // create spot lightsources.
        const xs = [30, -30];
        xs.forEach((v) => {
            const light = new SpotLight();
            light.position.set(v, 50, 30);
            this.scene.add(light);
        });
        // create other cube and add to the scene
        const boxGeometry = new BoxGeometry(1, 1, 1);
        const boxMaterial = new MeshLambertMaterial({color: 'red'});
        const boxMesh = new Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(2, 4, 8);
        boxMesh.name = 'box';
        this.scene.add(boxMesh);
        this.controls = new function() {
            this.lookAtCube = function () {
                pointer.lookAt(boxMesh.position);
            };
            this.lookAtSphere = function () {
                pointer.lookAt(sphereMesh.position);

            };
            this.lookAtTetra = function () {
                pointer.lookAt(tetraMesh.position);
            };
        };
        gui.add(this.controls, 'lookAtSphere');
        gui.add(this.controls, 'lookAtCube');
        gui.add(this.controls, 'lookAtTetra');

        super.run(gui);
    }
    render() {
        super.render();
    }
}

export { ObjectLookAtScreen };
