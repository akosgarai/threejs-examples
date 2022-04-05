# Webgl experiment

As i found the toolchan for generating javascript code from go code, i decided to write an application that uses the threejs library in the background. The threejs golang library seeems to be working, but i have to understand the threejs js library better if i want to use the golang lib more efficient.

The main goal is to write the application in js that i want to implement with the golang libs later. I want to see the necessary js functions to be able to find the good golang functions or solutions.

For experimental purposes, the google analytics tool has been added to the applicaton.

[Demo](https://akosgarai.github.io/threejs-examples/)

One of the demo application demonstrates the usage of the cssRenderer and webgl renderer in the same application. The youtube videos are handled with the css renderer, the skybox belongs to the webgl. You can interact (eg unmute) with the visible youtube videos after you set the pause to 1 or the rotation speed to 0.

![Sample gif from outer space](./examples/07-textured-spheres/sample/sample.gif)
