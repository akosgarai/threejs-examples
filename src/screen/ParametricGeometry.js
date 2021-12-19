import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, MeshPhongMaterial, Mesh, DoubleSide} from 'three';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry.js';
import {BasicScreen} from './BasicScreen.js';

class ParametricGeometryScreen extends BasicScreen {
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = -50;
        this.camera.position.y = 150;
        this.camera.position.z = 250;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);
        // create directional lightsource
        const directionalLight = new DirectionalLight();
        directionalLight.position.set(-30, 50, 50);
        this.scene.add(directionalLight);

        const geom = new ParametricGeometry(this.paramFunction5, 100, 100);
        const mat = new MeshPhongMaterial({color: 0xcc3333a, side: DoubleSide, flatShading: true});
        const mesh = new Mesh(geom, mat);
        mesh.name = 'param';
        mesh.scale.set(4, 4, 4);

        this.scene.add(mesh);

        super.run(gui);
    }
    render() {
        this.scene.getObjectByName('param').rotation.x += 0.01;
        this.scene.getObjectByName('param').rotation.y += 0.01;

        super.render();
    }
    paramFunction5(u, v, target) {
        const ur = u * Math.PI * 2;
        const vr = v * 8 * Math.PI;

        const x = Math.pow(1.2, vr) * Math.pow((Math.sin(ur)), 0.5) * Math.sin(vr);
        const y = vr * Math.sin(ur) * Math.cos(ur);
        const z = Math.pow(1.2, vr) * Math.pow((Math.sin(ur)), 0.3) * Math.cos(vr);

        target.set(x, y, z);
    }
}

export { ParametricGeometryScreen };
