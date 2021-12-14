import {DefaultScreen} from './default.js';

class Application {
    constructor() {
        this.screen = document.querySelector('#screen');
        this.applicationSelector = document.querySelector('#application-selector');
        this.apps = [];
        this.apps.push(new DefaultScreen(this.screen));
    }
    clearScreen() {
        while (this.screen.firstChild) {
            this.screen.removeChild(this.screen.lastChild);
        }
    }
    buildSelectMenu() {
        const list = document.createElement('select');
        list.id = 'app-selector';
        list.name = 'app-selector';
        const label = document.createElement('label');
        label.for = 'app-selector';
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
            optionNode.textContent = index;
            list.appendChild(optionNode);
        });
        list.addEventListener('change', (event) => {
            const value = event.target.value;
            this.clearScreen();
            if (value !== '') {
                this.apps[value].run();
            }
        });
    }
}
var app = new Application();
app.buildSelectMenu();
