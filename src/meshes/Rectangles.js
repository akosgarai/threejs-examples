import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PlaneGeometry,
    TextureLoader,
} from 'three';

class RectangleWithColor {
    constructor(width, height, depth, color, name) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.name = name;
    }
    getMesh() {
        const meshGeo = new BoxGeometry(this.width, this.height, this.depth);
        const meshMat = new MeshLambertMaterial({color: this.color});
        const mesh = new Mesh(meshGeo, meshMat);
        mesh.name = this.name;
        return mesh;
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
        const geometry = new PlaneGeometry(this.width, this.height);
        const texture = new TextureLoader().load(this.texture);
        const material = new MeshBasicMaterial({ map: texture , transparent: this.transparent });
        const mesh = new Mesh(geometry, material);
        mesh.name = this.name;
        return mesh;
    }
}
export { RectangleWithColor, RectangleWithTexture };
