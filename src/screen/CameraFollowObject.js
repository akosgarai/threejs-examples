import {Scene, PerspectiveCamera, WebGLRenderer, SpotLight, PlaneGeometry, SphereGeometry, BoxGeometry, MeshPhongMaterial, MeshLambertMaterial, TextureLoader, RepeatWrapping, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class CameraFollowObjectScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.step = 0.0;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 15;
        this.camera.position.y = 6;
        this.camera.position.z = 15;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);
        // create spot light and add it to the scene
        const spotLight = new SpotLight();
        spotLight.position.set(0, 80, 30);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        // floor
        this.addFloor();
        // sphere
        this.addBouncingSphere();
        // cube
        this.addCube();

        super.run(gui);
    }
    render() {
        const sphere = this.scene.getObjectByName('sphere');
        this.camera.lookAt(sphere.position);
        this.controls.step += 0.02;
        sphere.position.x = 0 + ( 10 * (Math.cos(this.controls.step)));
        sphere.position.y = 0.75 * Math.PI / 2 + ( 6 * Math.abs(Math.sin(this.controls.step)));

        super.render();
    }
    addFloor() {
        const floorGeometry = new PlaneGeometry(100, 100, 20, 20);
        const floorTexture = new TextureLoader().load('./assets/texture/paper.png');
        const floorMaterial = new MeshPhongMaterial({ map: floorTexture });

        floorMaterial.map.wrapS = floorMaterial.map.wrapT = RepeatWrapping;
        floorMaterial.map.repeat.set(8, 8);
        var floorMesh = new Mesh(floorGeometry, floorMaterial);
        floorMesh.receiveShadow = true;
        floorMesh.rotation.x = -0.5 * Math.PI;
        this.scene.add(floorMesh);
    }
    addBouncingSphere() {
        const sphereGeometry = new SphereGeometry(1.5, 20, 20);
        const matProps = {

            specular: '#a9fcff',
            color: '#00abb1',
            emissive: '#006063',
            shininess: 10
        }

        const sphereMaterial = new MeshPhongMaterial(matProps);
        const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.castShadow = true;
        sphereMesh.position.y = 0.75 * Math.PI / 2;
        sphereMesh.name = 'sphere';
        this.scene.add(sphereMesh);
    }
    addCube() {
        var cubeGeometry = new BoxGeometry(2.5, 4.5, 20);
        var cubeMaterial = new MeshLambertMaterial({color: 0xff0000});
        var cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        cubeMesh.position.z = -5;
        this.scene.add(cubeMesh);
    }
}

export { CameraFollowObjectScreen };
