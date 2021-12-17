import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, BufferGeometry, Vector3, Face3, Mesh, MeshLambertMaterial, SphereGeometry} from 'three';
import {BasicScreen} from './BasicScreen.js';

class HeightMapScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.depth = 512;
            this.width = 512;
            this.spacingX = 3;
            this.spacingz = 3;
            this.heightOffset = 2;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 1200;
        this.camera.position.y = 500;
        this.camera.position.z = 1500;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setClearColor(0x000000, 1.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // add light
        const light = new DirectionalLight();
        light.position.set(1200, 1200, 1200);
        this.scene.add(light);
        this.createGeometryFromHeightMap();
        this.screenNode.appendChild(this.renderer.domElement);
        super.run(gui);
    }
    render() {
        super.render();
    }
    createGeometryFromHeightMap() {
        const canvas = document.createElement('canvas');
        let control = this.controls;
        let scene = this.scene;
        canvas.width = control.width;
        canvas.height = control.depth;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = "./assets/heightmap/example.png";
        img.onload = function () {
            // draw on canvas
            ctx.drawImage(img, 0, 0);
            const pixel = ctx.getImageData(0, 0, control.width, control.depth);

            const pixelPoints = [];
            for (let x = 0; x < control.depth; x++) {
                for (let z = 0; z < control.width; z++) {
                    // get pixel
                    // since we're grayscale, we only need one element

                    const yValue = pixel.data[z * 4 + (control.depth * x * 4)] / control.heightOffset;
                    pixelPoints.push(new Vector3(x * control.spacingX, yValue, z * control.spacingZ));
                }
            }

            // we create a rectangle between four vertices, and we do
            // that as two triangles.
            const geometryPoints = [];
            for (let z = 0; z < control.depth - 1; z++) {
                for (let x = 0; x < control.width - 1; x++) {
                    // we need to point to the position in the array
                    // a - - b
                    // |  x  |
                    // c - - d
                    const a = x + z * control.width;
                    const b = (x + 1) + (z * control.width);
                    const c = x + ((z + 1) * control.width);
                    const d = (x + 1) + ((z + 1) * control.width);

                    geometryPoints.push(pixelPoints[a]);
                    geometryPoints.push(pixelPoints[b]);
                    geometryPoints.push(pixelPoints[d]);
                    geometryPoints.push(pixelPoints[d]);
                    geometryPoints.push(pixelPoints[c]);
                    geometryPoints.push(pixelPoints[a]);
                }
            }
            let geometry = new BufferGeometry()
            geometry.setFromPoints(geometryPoints)
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            const zMax = geometry.boundingBox.max.z;
            const xMax = geometry.boundingBox.max.x;

            const mesh = new Mesh(geometry, new MeshLambertMaterial({ color: 0x666666 }));
            mesh.name = 'valley';
            mesh.translateX(-xMax / 2);
            mesh.translateZ(-zMax / 2);
            scene.add(mesh);
        };
    }
}

export { HeightMapScreen };
