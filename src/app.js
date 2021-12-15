import {DefaultScreen} from './default.js';
import {AnimationLoopScreen} from './animationloop.js';
import {StatsScreen} from './stats.js';
import {GuiScreen} from './gui.js';

class Application {
    constructor() {
        this.screen = document.querySelector('#screen');
        this.applicationSelector = document.querySelector('#application-selector');
        this.apps = [];
        this.apps.push(new DefaultScreen(this.screen));
        this.apps.push(new AnimationLoopScreen(this.screen));
        this.apps.push(new StatsScreen(this.screen));
        this.apps.push(new GuiScreen(this.screen));
        this.selectedApp = '';
    }
    clearScreen() {
        // first stop the active screen.
        if (this.selectedApp !== '') {
            this.apps[this.selectedApp].stop();
        }
        while (this.screen.firstChild) {
            this.screen.removeChild(this.screen.lastChild);
        }
    }
    buildSelectMenu() {
        const list = document.createElement('select');
        list.id = 'app-selector';
        list.name = 'app-selector';
        const label = document.createElement('label');
        label.setAttribute('for', 'app-selector');
        label.textContent = 'Select application';
        label.appendChild(list);
        const defaultOptionNode = document.createElement('option');
        defaultOptionNode.value = '';
        defaultOptionNode.textContent = ' -- Select -- ';
        list.appendChild(defaultOptionNode);
        this.applicationSelector.appendChild(label);
        this.apps.forEach((item, index) => {
            const optionNode = document.createElement('option');
            optionNode.value = index;
            optionNode.textContent = item.applicationName();
            list.appendChild(optionNode);
        });
        list.addEventListener('change', (event) => {
            this.clearScreen();
            this.selectedApp = event.target.value;
            if (this.selectedApp !== '') {
                this.apps[this.selectedApp].run();
            }
        });
    }
}
var app = new Application();
app.buildSelectMenu();
