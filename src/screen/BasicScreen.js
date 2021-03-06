import Stats from 'three/examples/jsm/libs/stats.module.js';

class BasicScreen {
    constructor(name, screen, controls) {
        this.name = name;
        this.screenNode = screen;
        this.controls = controls || new function() {};
        this.gui = null;
        this.stats = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
    }
    run(gui) {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.gui = gui;
        this.animate();
    }
    stop() {
        if (this.gui !== null) {
            this.gui.destroy();
        }
    }
    buildFPSStats() {
        this.stats = new Stats();
        this.stats.setMode(0);
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0';
        this.stats.domElement.style.top = '0';
        this.screenNode.appendChild(this.stats.domElement);
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }
    render() {
        if (this.renderer !== null && this.scene !== null && this.camera !== null) {
            this.renderer.render(this.scene, this.camera);
        }
        if (this.stats !== null) {
            this.stats.update();
        }
    }
    applicationName() {
        return this.name;
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export { BasicScreen };
