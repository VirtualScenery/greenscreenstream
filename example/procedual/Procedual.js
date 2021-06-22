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
        const track = mediaStream.getVideoTracks()[0];
        const cap = { w: track.getCapabilities().width, h: track.getConstraints().height };
        let greenscreen = new GreenScreenStream_1.GreenScreenStream(GreenScreenStream_1.GreenScreenMethod.VirtualBackground, document.querySelector("canvas"), cap.w, cap.h);
        greenscreen.addVideoTrack(track);
        // override the default shader
        greenscreen.bufferFrag = fractal_glsl_1.default;
        greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
            greenscreen.start();
            console.log("Starting");
        }).catch(e => {
            greenscreen.stop();
            console.error(e);
        });
    }, (e) => console.error(e));
});
//# sourceMappingURL=Procedual.js.map