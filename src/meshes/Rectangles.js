import {BoxGeometry, Mesh, MeshLambertMaterial} from 'three';

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

export { RectangleWithColor };
