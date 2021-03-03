"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    let instance = GreenScreenStream_1.GreenScreenStream.getInstance(true, null, null, 800, 450);
    navigator.getUserMedia({ video: { width: 800, height: 450 }, audio: false }, (m) => {
        // Add the captured media stream ( video track )
        instance.addVideoTrack(m.getTracks()[0]);
        instance.getMask(document.querySelector("canvas"), {
            backgroundColor: { r: 0, g: 177,
                b: 64, a: 127 }
        });
    }, (e) => console.error(e));
    // expose to window.
    window["gss"] = instance;
});
