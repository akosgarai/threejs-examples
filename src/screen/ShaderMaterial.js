import {
    Group,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    RawShaderMaterial,
    Scene,
    TextureLoader,
    Vector3,
    WebGLRenderer,
} from 'three';
import {BasicScreen} from './BasicScreen.js';
import {
    Navigation,
} from '../meshes/groups/SpaceTruck.js';

const vertexShader = `#version 300 es
in vec3 position;
in vec3 normal;
in vec2 uv;

out vec2 texCoord;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main() {
    texCoord = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;
const fragmentShader = `#version 300 es
precision highp float;

out vec4 FragColor;

in vec2 texCoord;

uniform sampler2D text;

void main() {
    FragColor = texture(text, texCoord);
}
`;
class ShaderMaterial {
    constructor(uniforms, vertexShader, fragmentShader) {
        this.uniforms = uniforms;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
    }
    getMaterial() {
        return new RawShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: true,
        });
    }
}

class RectangleWithTexture {
    constructor(width, height, name, texture, transparent) {
        this.width = width;
        this.height = height;
        this.name = name;
        this.texture = texture;
        this.transparent = transparent;
    }
    getMesh() {
        // Plane geometry sets the following attributes:
        // 1. position - the position of the vertex in the object.
        // 2. normal - the normal vector of the vertex.
        // 3. uv - the texture coordinates of the vertex.
        const uniforms = {
            text: { value: this.texture },
        };
        const geometry = new PlaneGeometry(this.width, this.height);
        const material = new ShaderMaterial(uniforms, vertexShader, fragmentShader).getMaterial();
        const mesh = new Mesh(geometry, material);
        mesh.name = this.name;
        return mesh;
    }
}

/*
 * This class represents a basic Mesh group that looks like a space truck.
 */
class SpaceTruck {
    constructor(groupName) {
        this.groupName = groupName;
    }
    getGroup() {
        const group = new Group();
        // The spaceship is a squere with a texture.
        // The texture size is 128*256.
        // The spaceship is 50*100.
        const textureSTT = new TextureLoader().load('assets/texture/SpaceTruckTop.png');
        const spaceTruckBase = new RectangleWithTexture(50, 100, 'truck', textureSTT, true).getMesh();
        const textureSTR = new TextureLoader().load('assets/texture/SpaceTruckRockets.png');
        const spaceTruckEngines = new RectangleWithTexture(50, 100, 'engine', textureSTR, true).getMesh();
        const textureSTRF = new TextureLoader().load('assets/texture/SpaceTruckRocketFlames.png');
        const engineFire = new RectangleWithTexture(50, 100, 'burst', textureSTRF, true).getMesh();
        // the rockets has to be moved to the top of the truck.
        spaceTruckEngines.position.z = 5;
        engineFire.position.z = 10;
        engineFire.visible = false;
        group.add(spaceTruckBase);
        group.add(spaceTruckEngines);
        group.add(engineFire);

        group.name = this.groupName;

        return group;
    }
}

// The space contains 9 textured meshes in a group.
// The space is a 3x3 grid. The middle is the ship.
// When it moves out from the middle, the grid changes with it.
// The grid is 1000x1000 pixels.
class Space {
    constructor() {
        this.spaceZ = -1000;
        this.gridSize = 10000;
        this.group = new Group();
        const textureSpace = new TextureLoader().load('assets/space/space-background-simple.png');
        this.grid = [
            // Top row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-left', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-middle', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-right', textureSpace, true).getMesh(),
            ],
            // Middle row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-left', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-middle', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-right', textureSpace, true).getMesh(),
            ],
            // Bottom row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-left', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-middle', textureSpace, true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-right', textureSpace, true).getMesh(),
            ],
        ];

        this.buildGrid(new Vector3(0, 0, 0));

        this.grid.forEach((row) => {
            row.forEach((grid) => {
                this.group.add(grid);
            });
        });
    }
    buildGrid(middlePosition) {
        const tileX = Math.floor(middlePosition.x / this.gridSize);
        const tileY = Math.floor(middlePosition.y / this.gridSize);
        const typeX = this.mod3(tileX+1);
        const typeY = this.mod3(tileY+1);
        // middle position
        this.grid[typeY][typeX].position.set(tileX*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // left from the middle position
        this.grid[typeY][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // right from the middle position
        this.grid[typeY][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // top row, left to right
        this.grid[this.mod3(typeY+1)][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY+1)][typeX].position.set(tileX*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY+1)][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        // bottom row, left to right
        this.grid[this.mod3(typeY-1)][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY-1)][typeX].position.set(tileX*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY-1)][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
    }
    mod3(n) {
        let mod = n % 3;
        if (mod < 0) {
            mod += 3;
        }
        return mod;
    }
    getGroup() {
        return this.group;
    }
    update(shipPosition) {
        this.buildGrid(shipPosition);
    }
}

// Based on the following document: https://codinhood.com/post/create-skybox-with-threejs
/*
 * This class represents a screen with a spaceship and a skybox.
 * The spaceship is controlled by the arrow keys or with the 'w', 'a', 'd' keys.
 * States of the spaceship:
 * 1. The spaceship is rotating left.
 * 2. The spaceship is rotating right.
 * 3. The spaceship is bursting the engine.
 * 4. The spaceship is idle. - the default state. In this state the spaceship is not rotating and the engine is not bursting, so the spaceship is moving with a constant velocity to the velocity direction.
 * */
class ShaderMaterialScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            // rotation of the spaceship around the z axis.
            this.spaceshipRotation = 0;
            // spaceship velocity.
            this.spaceshipVelocity = 0;
            this.velocityDirection = 0;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200000);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        this.space = new Space();
        this.scene.add(this.space.getGroup());

        this.initSpaceShip();

        gui.add(this.controls, 'spaceshipRotation');
        gui.add(this.controls, 'spaceshipVelocity');
        gui.add(this.controls, 'velocityDirection');
        window.addEventListener('keydown', this.onKeyPress.bind(this), false);
        window.addEventListener('keyup', this.onKeyReleased.bind(this), false);

        super.run(gui);
    }
    render() {
        this.update();
        this.updateGui();
        super.render();
    }
    initSpaceShip() {
        const spaceship = new SpaceTruck('spaceship').getGroup();
        this.scene.add(spaceship);
        this.navigation = new Navigation(spaceship);
        // The camera is 1000 units above the spaceship.
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(spaceship.position);
    }
    // Key press event handler.
    onKeyPress(event) {
        const code = event.code;
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.navigation.setState('rotatingLeft');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.navigation.setState('rotatingRight');
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.navigation.setState('burst');
                break;
        }
    }
    onKeyReleased(event) {
        const code = event.code;
        switch (code) {
            case 'KeyP':
                const ship = this.scene.getObjectByName('spaceship');
                console.log('navigation ' + this.navigation.velocity + ' velocity ' + this.navigation.velocityDirection + ' direction');
                console.log('ship rotation: ' + ship.rotation.z);
                console.log('ship position: ' + ship.position.x + ' ' + ship.position.y);
                console.log('space', this.space.grid);
                break;
        }
    }
    // update the gui. Set the rotation of the spaceship.
    updateGui() {
        this.gui.controllers.forEach((item, index) => {
            switch (item._name) {
                case 'spaceshipRotation':
                    // calculate the rotation in degrees.
                    // right is 90 degrees, left is -90 degrees.
                    let rotation = this.navigation.rotationAngleDegree;
                    if (rotation > 180) {
                        rotation = rotation - 360;
                    }
                    item.setValue(-rotation);
                    break;
                case 'spaceshipVelocity':
                    item.setValue(this.navigation.velocity);
                    break;
                case 'velocityDirection':
                    let rotationDeg = this.navigation.velocityDirection * 180 / Math.PI;
                    if (rotationDeg > 180) {
                        rotationDeg = rotationDeg - 360;
                    }
                    item.setValue(-rotationDeg);
                    break;
            }
        })
    }
    update() {
        const now = new Date().getTime();
        this.navigation.update(now);
        this.navigation.move();
        // update the camera position.
        this.syncCamera();
        this.space.update(this.navigation.group.position);
    }
    syncCamera() {
        const ship = this.navigation.group;
        this.camera.position.set(ship.position.x, ship.position.y, 1000);
        this.camera.lookAt(ship.position);
    }
}

export { ShaderMaterialScreen };
