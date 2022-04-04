import {Scene, PerspectiveCamera, Group} from 'three';
import {CSS3DRenderer, CSS3DObject} from 'three/examples/jsm/renderers/CSS3DRenderer';

import {BasicScreen} from './BasicScreen.js';

// Based on the following document: https://codinhood.com/post/create-skybox-with-threejs
class CSS3DRendererExampleScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.rotationY = 0;
        };
        super(name, screen, control);
    }
    run(gui) {
        window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
        this.camera.position.set( 0, 50, 950 );
        // create a render, sets the size
        this.renderer = new CSS3DRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screenNode.appendChild(this.renderer.domElement);

        const group = new Group();
        group.add( this.addElement( '2Z4m4lnjxkY', 0, 0, 240, 0 ) );
        group.add( this.addElement( '2Z4m4lnjxkY', 240, 0, 0, Math.PI / 2 ) );
        group.add( this.addElement( '2Z4m4lnjxkY', 0, 0, - 240, Math.PI ) );
        group.add( this.addElement( '2Z4m4lnjxkY', - 240, 0, 0, - Math.PI / 2 ) );
        group.name = 'videos';
        this.scene.add( group );

        gui.add(this.controls, 'rotationY', -0.1, 0.1);

        super.run(gui);
    }
    render() {
        this.scene.getObjectByName('videos').rotation.y += this.controls.rotationY;
        super.render();
    }
    addElement( id, x, y, z, ry ) {
        const div = document.createElement( 'div' );
        div.style.width = '480px';
        div.style.height = '360px';
        div.style.backgroundColor = '#000';

        const iframe = document.createElement( 'iframe' );
        iframe.style.width = '480px';
        iframe.style.height = '360px';
        iframe.style.border = '0px';
        iframe.src = [ 'http://www.youtube.com/embed/', id, '?rel=0&autoplay=1&mute=1&enablejsapi=1' ].join( '' );
        iframe.setAttribute('id', id + '-' + document.querySelectorAll('iframe').length);
        div.appendChild( iframe );

        const object = new CSS3DObject( div );
        object.position.set( x, y, z );
        object.rotation.y = ry;

        return object;
    }
    onYouTubeIframeAPIReady() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const player = new YT.Player(iframe, {
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange
                }
            });
        });
    }
    onPlayerReady(event) {
        event.target.setVolume(100);
    }
    onPlayerStateChange(event) {
    }
}
export { CSS3DRendererExampleScreen };
