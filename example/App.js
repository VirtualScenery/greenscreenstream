"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    let instance = GreenScreenStream_1.GreenScreenStream.getInstance("assets/palmtrees.jpg");
    navigator.getUserMedia({ video: true, audio: false }, (m) => {
        instance.addVideoTrack(m.getTracks()[0]);
        instance.render();
        document.querySelector("video").srcObject = instance.captureStream(25);
    }, (e) => console.error(e));
    // expose to  window.
    window["greatStream"] = instance;
});
