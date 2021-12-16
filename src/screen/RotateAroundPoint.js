import {Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, BoxGeometry, MeshLambertMaterial, Mesh, PCFSoftShadowMap, Object3D, SpotLight} from 'three';
import {BasicScreen} from './BasicScreen.js';

class RotationAroundPointScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.sphereRotationSpeedX = 0.0;
            this.sphereRotationSpeedY = 0.0;
            this.sphereRotationSpeedZ = 0.0;

            this.rotationX = 0.4;
            this.rotationY = 0;
            this.rotationZ = 0;

            this.cubeRotationSpeedX = 0.00001;
            this.cubeRotationSpeedY = 0.00001;
            this.cubeRotationSpeedZ = 0.00001;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 25;
        this.camera.position.y = 26;
        this.camera.position.z = 23;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapType = PCFSoftShadowMap;
        this.screenNode.appendChild(this.renderer.domElement);
        // create a simple sphere
        const sphereGeometry = new SphereGeometry(6.5, 20, 20);
        const sphereMaterial = new MeshLambertMaterial({color: 0x5555ff});
        const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.receiveShadow = true;
        sphereMesh.position.set(0, 1, 0);
        sphereMesh.name = 'sphere';
        this.scene.add(sphereMesh);
        // add an object as pivot point to the sphere
        const pivotPoint = new Object3D();
        pivotPoint.rotation.x = 0.4;
        pivotPoint.name = 'pivot';
        sphereMesh.add(pivotPoint);
        // create a cube and add to scene
        const cubeGeometry = new BoxGeometry(2, 4, 2);
        const cubeMaterial = new MeshLambertMaterial({color: 0xff0000});
        const cube = new Mesh(cubeGeometry, cubeMaterial);
        // position is relative to it's parent
        cube.position.set(14, 4, 6);
        cube.name = 'cube';
        cube.castShadow = true;
        // make the pivotpoint the cube's parent.
        pivotPoint.add(cube);
        // add some light
        const light = new SpotLight();
        light.position.set(40, 4, 40);
        light.castShadow = true;
        light.shadowMapEnabled = true;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 100;
        this.scene.add(light);
        // GUI
        gui.add(this.controls, 'sphereRotationSpeedX', -0.1, 0.1);
        gui.add(this.controls, 'sphereRotationSpeedY', -0.1, 0.1);
        gui.add(this.controls, 'sphereRotationSpeedZ', -0.1, 0.1);
        gui.add(this.controls, 'rotationX').onChange((v) => {
            this.scene.getObjectByName('pivot').rotation.x = v;
        });
        gui.add(this.controls, 'rotationY').onChange((v) => {
            this.scene.getObjectByName('pivot').rotation.y = v;
        });
        gui.add(this.controls, 'rotationZ').onChange((v) => {
            this.scene.getObjectByName('pivot').rotation.z = v;
        });
        gui.add(this.controls, 'cubeRotationSpeedX', -0.1, 0.1);
        gui.add(this.controls, 'cubeRotationSpeedY', -0.1, 0.1);
        gui.add(this.controls, 'cubeRotationSpeedZ', -0.1, 0.1);
        //
        // stats
        this.buildFPSStats();

        super.run(gui);
    }
    render() {
        this.scene.getObjectByName('pivot').rotation.x += this.controls.sphereRotationSpeedX;
        this.scene.getObjectByName('pivot').rotation.y += this.controls.sphereRotationSpeedY;
        this.scene.getObjectByName('pivot').rotation.z += this.controls.sphereRotationSpeedZ;

        this.controls.rotationX = this.scene.getObjectByName('pivot').rotation.x;
        this.controls.rotationY = this.scene.getObjectByName('pivot').rotation.y;
        this.controls.rotationZ = this.scene.getObjectByName('pivot').rotation.z;

        this.scene.getObjectByName('cube').rotation.x += this.controls.cubeRotationSpeedX;
        this.scene.getObjectByName('cube').rotation.y += this.controls.cubeRotationSpeedY;
        this.scene.getObjectByName('cube').rotation.z += this.controls.cubeRotationSpeedZ;
        super.render();
    }
}

export { RotationAroundPointScreen };
