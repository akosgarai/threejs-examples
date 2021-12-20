import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, BoxGeometry, TextureLoader, MeshLambertMaterial, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class CameraZoomScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.correctForDepth = 1.3;
            this.rotationSpeed = 0.01;
            this.scale = 1;
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
        this.camera.position.y = 15;
        this.camera.position.z = 15;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xaaaaaa, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        // Setup directional light
        const directionalLight = new DirectionalLight();
        directionalLight.position.set(40, 40, 20);
        this.scene.add(directionalLight);
        // cube with a texture.
        const cubeGeometry = new BoxGeometry(2, 2, 2);
        const cubeTexture = new TextureLoader().load('./assets/texture/paper.png');
        const cubeMaterial = new MeshLambertMaterial({ color: 0xffffff, map: cubeTexture });
        const cube = new Mesh(cubeGeometry, cubeMaterial);
        cube.name = 'cube';
        cube.position.set(0, 0, 0);
        this.scene.add(cube);
        // add the button to the controls
        this.controls.updateCamera = this.updateCamera.bind(this);
        gui.add(this.controls, 'correctForDepth', 1, 3);
        gui.add(this.controls, 'updateCamera');
        gui.add(this.controls, 'rotationSpeed', -1, 1).step(0.001);
        gui.add(this.controls, 'scale', 0, 2).step(0.001);

        super.run(gui);
    }
    updateCamera() {
        const cube = this.scene.getObjectByName('cube');
        cube.geometry.computeBoundingBox();
        console.log(cube);
        // calculate the distance from the center of the sphere
        // and subtract the radius to get the real distance.
        var center = cube.geometry.boundingSphere.center;
        var radius = cube.geometry.boundingSphere.radius;

        var distance = center.distanceTo(this.camera.position) - radius;
        var realHeight = Math.abs(cube.geometry.boundingBox.max.y - cube.geometry.boundingBox.min.y);

        var fov = 2 * Math.atan(realHeight * this.controls.correctForDepth / ( 2 * distance )) * ( 180 / Math.PI );

        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    }
    render() {
        this.scene.getObjectByName('cube').rotation.x += this.controls.rotationSpeed;
        this.scene.getObjectByName('cube').scale.set(this.controls.scale, this.controls.scale, this.controls.scale);
        super.render();
    }
}

export { CameraZoomScreen };
