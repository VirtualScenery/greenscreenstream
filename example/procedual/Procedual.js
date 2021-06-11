"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
// thank you Aurélien Prunier
const fractal_glsl_1 = __importDefault(require("./fractal.glsl"));
document.addEventListener("DOMContentLoaded", () => {
    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (mediaStream) => {
        let greenscreen = new GreenScreenStream_1.GreenScreenStream(GreenScreenStream_1.GreenScreenMethod.VirtualBackground, document.querySelector("canvas"), 640, 360);
        greenscreen.addVideoTrack(mediaStream.getVideoTracks()[0]);
        // override the default shader
        greenscreen.bufferFrag = fractal_glsl_1.default;
        greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
            greenscreen.start();
        }).catch(e => {
            greenscreen.stop();
            console.error(e);
        });
    }, (e) => console.error(e));
});
