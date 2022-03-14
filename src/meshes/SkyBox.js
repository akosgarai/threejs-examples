import {BoxGeometry, Mesh, TextureLoader, MeshBasicMaterial, BackSide} from 'three';

class SkyBox {
    constructor(name, filename, size) {
        this.skyBoxName = name;
        this.fileName = filename;
        this.skyBoxSize = size;
    }
    createSkyBoxPathStrings() {
        const basePath = './assets/skybox/';
        const baseFilename = basePath + this.fileName;
        const fileType = '.png';
        const sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];
        const pathStings = sides.map(side => {
            return baseFilename + '-' + side + fileType;
        });
        return pathStings;
    }
    createSkyBoxMaterial() {
        const skyboxImagepaths = this.createSkyBoxPathStrings();
        const materialArray = skyboxImagepaths.map(image => {
            let texture = new TextureLoader().load(image);
            return new MeshBasicMaterial({ map: texture, side: BackSide }); // <---
        });
        return materialArray;
    }
    getSkyBox() {
        const skyBoxGeo = new BoxGeometry(this.skyBoxSize, this.skyBoxSize, this.skyBoxSize);
        const skyBoxMat = this.createSkyBoxMaterial();
        const skyBox = new Mesh(skyBoxGeo, skyBoxMat);
        skyBox.name = this.skyBoxName;
        return skyBox;
    }
}

export { SkyBox };
