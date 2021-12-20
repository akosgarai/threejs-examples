import GUI from 'lil-gui';

import {DefaultScreen} from './screen/Default.js';
import {AnimationLoopScreen} from './screen/AnimationLoop.js';
import {StatsScreen} from './screen/Stats.js';
import {GuiScreen} from './screen/Gui.js';
import {RotationAroundPointScreen} from './screen/RotateAroundPoint.js';
import {HeightMapScreen} from './screen/HeightMapPng.js';
import {ObjectLookAtScreen} from './screen/ObjectLookAt.js';
import {ParametricGeometryScreen} from './screen/ParametricGeometry.js';
import {SplineCurveScreen} from './screen/SplineCurve.js';
import {ObjectMaterialLoaderScreen} from './screen/ObjectMaterialLoader.js';

class Application {
    constructor() {
        this.screen = document.querySelector('#screen');
        this.apps = [];
        this.apps.push(new DefaultScreen('Default screen', this.screen));
        this.apps.push(new AnimationLoopScreen('Animation Loop', this.screen));
        this.apps.push(new StatsScreen('Stats screen', this.screen));
        this.apps.push(new GuiScreen('Gui screen', this.screen));
        this.apps.push(new RotationAroundPointScreen('Rotation around point', this.screen));
        this.apps.push(new HeightMapScreen('Height map from PNG', this.screen));
        this.apps.push(new ObjectLookAtScreen('Object look at', this.screen));
        this.apps.push(new ParametricGeometryScreen('Parametric geometry', this.screen));
        this.apps.push(new SplineCurveScreen('Draw spline', this.screen));
        this.apps.push(new ObjectMaterialLoaderScreen('Object and material loading', this.screen));
        this.controls = new function() {
            this.selectedApp = '';
        };
        this.gui = null;
    }
    clearScreen() {
        // first stop the active screen.
        if (this.controls.selectedApp !== '') {
            this.apps[this.controls.selectedApp].stop();
        }
        while (this.screen.firstChild) {
            this.screen.removeChild(this.screen.lastChild);
        }
        this.initGUI();
    }
    initGUI() {
        // destroy the GUI if we have.
        if (this.gui !== null) {
            this.gui.destroy();
        }
        // create a new gui instance.
        this.gui = new GUI();
        // create options with the default value.
        let options = {
            ' -- Select -- ': '',
        };
        // extend options with the installed applications.
        this.apps.forEach((item, index) => {
            options[item.applicationName()] = index;
        });
        // add select to gui with custom change function.
        this.gui.add( this.controls, 'selectedApp', options )
            .name( 'Application' )
            .onChange( value => {
                this.clearScreen();
                if (value !== '') {
                    this.apps[value].run(this.gui);
                }
            } );
    }
}
var app = new Application();
app.clearScreen();
