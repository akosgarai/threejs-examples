import {SphereGeometry, Mesh, TextureLoader, MeshPhongMaterial} from 'three';

class SphereWithTexture {
    constructor(name, filename, radius, width, height) {
        this.name = name;
        this.fileName = filename;
        this.radius = radius;
        this.width = width;
        this.height = height;
    }
    createSphereMaterial() {
        const imagePath = './assets/texture/'+this.fileName;
        let texture = new TextureLoader().load(imagePath);
        return new MeshPhongMaterial({ map: texture });
    }
    getMesh() {
        const sphereGeo = new SphereGeometry(this.radius, this.width, this.height);
        const sphereMat = this.createSphereMaterial();
        const sphere = new Mesh(sphereGeo, sphereMat);
        sphere.name = this.name;
        return sphere;
    }
}
export { SphereWithTexture };
