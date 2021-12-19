import {Scene, PerspectiveCamera, WebGLRenderer, Vector3, QuadraticBezierCurve3, TubeGeometry, MeshNormalMaterial, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class SplineCurveScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.curveStart = -20;
            this.curveMiddle = 30
            this.curveEnd = 20;
            this.numOfPoints = 100;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 0;
        this.camera.position.y = 40;
        this.camera.position.z = 40;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);
        // Extend gui with the draw spline methods.
        gui.add(this.controls, 'numOfPoints', 5, 200, 1).onChange(this.drawSpline.bind(this));
        gui.add(this.controls, 'curveStart', -22, -11, 0.01).onChange(this.drawSpline.bind(this));
        gui.add(this.controls, 'curveEnd', 11, 22, 0.01).onChange(this.drawSpline.bind(this));
        gui.add(this.controls, 'curveMiddle', 0.5, 60, 0.01).onChange(this.drawSpline.bind(this));
        // Draw the spline with the default values.
        this.drawSpline();

        super.run(gui);
    }
    render() {
        super.render();
    }
    drawSpline() {
        // remove the spline if it is already on the screen.
        const currentTube = this.scene.getObjectByName('tube');
        if (currentTube) {
            this.scene.remove(currentTube);
        }
        const horisontal = 20;
        // smooth my curve over this many points
        const start = new Vector3(this.controls.curveStart, -horisontal, 0);
        const middle = new Vector3(0, this.controls.curveMiddle- horisontal, 0);
        const end = new Vector3(this.controls.curveEnd, -horisontal, 0);

        const curveQuad = new QuadraticBezierCurve3(start, middle, end);

        const tube = new TubeGeometry(curveQuad, Math.round(this.controls.numOfPoints), 2, 20, false);
        const mesh = new Mesh(tube, new MeshNormalMaterial({opacity: 0.6, transparent: true}));
        mesh.name = 'tube';

        this.scene.add(mesh);
    }
}

export { SplineCurveScreen };
