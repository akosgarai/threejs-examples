import Stats from 'three/examples/jsm/libs/stats.module.js';

class HUDScreen {
    constructor(name, screen, controls) {
        this.name = name;
        this.screenNode = screen;
        this.controls = controls || new function() {};
        this.gui = null;
        this.stats = null;
        this.renderer = null;
        this.renderables = [];
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
        if (this.renderer !== null && this.renderables.length > 0) {
            this.renderables.forEach((renderable, index) => {
                if (index > 0) {
                    this.renderer.clearDepth();
                }
                this.renderer.render(renderable.scene, renderable.camera);
            });
        }
        if (this.stats !== null) {
            this.stats.update();
        }
    }
    applicationName() {
        return this.name;
    }
    onWindowResize() {
        this.renderables.forEach(renderable => {
            // in case of perspective camera, we need to update the aspect ratio.
            // in case of orthographic camera, we need to update the size of the camera.
            if (renderable.camera.isPerspectiveCamera) {
                renderable.camera.aspect = window.innerWidth / window.innerHeight;
            } else {
                renderable.camera.left = window.innerWidth / -2;
                renderable.camera.right = window.innerWidth / 2;
                renderable.camera.top = window.innerHeight / 2;
                renderable.camera.bottom = window.innerHeight / -2;
            }
            renderable.camera.updateProjectionMatrix();
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export { HUDScreen };
