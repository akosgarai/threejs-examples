
## Executed commands

- Generate package.json file.

```bash
npm init
```

- Add webpack as dependency.

```bash
npm install --save-dev webpack
```

- Add @babel/cli as dependency.

```bash
npm install --save-dev @babel/cli
```

- Add three as dependency.

```bash
npm install --save three
```

- Add chai as dependency.

```bash
npm install --save-dev chai
```

- Add eslint as dependency.

```bash
npm install eslint --save-dev
```

- Add mocha as dependency.

```bash
npm install mocha --save-dev
```

- Add webpack-cli as dependency.

```bash
npm install --save-dev webpack-cli
```

- Add @babel/core as dependency.

```bash
npm install --save-dev @babel/core
```

- Add path as dependency.

```bash
npm install --save path
```

- Add @babel/preset-env as dependency.

```bash
npm install --save-dev @babel/preset-env
```

- Add babel-loader as dependency.

```bash
npm install --save-dev babel-loader
```

- Add lil-gui as dependency.

```bash
npm install --save lil-gui
```

## Screens

### Basic screen

This is responsible for holding the common logic and parameters.

- name: The human readable name of the screen. it is used in the application selector GUI item.
- screenNode: The dom item that holds the canvas.
- controls: It holds the control variables.
- gui: It holds the gui component. On case of stop, the gui has to be destroyed to remove it from the screen.
- stats:
- renderer:
- camera:
- scene:
