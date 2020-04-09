"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    let instance = GreenScreenStream_1.GreenScreenStream.getInstance("assets/costarica.jpg");
    let customChromaKey = {
        r: 0,
        g: 0,
        b: 0
    };
    navigator.getUserMedia({ video: true, audio: false }, (m) => {
        instance.addVideoTrack(m.getTracks()[0]);
        instance.render();
        document.querySelector("video").srcObject = instance.captureStream(25);
        const detectedColor = document.querySelector(".dominates");
        detectedColor.addEventListener("click", () => {
            instance.setChromaKey(customChromaKey.r, customChromaKey.g, customChromaKey.b);
        });
        // detect color 2 / second
        setInterval(() => {
            let colors = instance.getColorsFromStream();
            let d = colors.dominant;
            //let p = colors.palette; // not displayed
            const s = `rgb(${d[0]},${d[1]},${d[2]}`;
            detectedColor.style.background = s;
            customChromaKey.r = d[0] / 255;
            customChromaKey.g = d[1] / 255;
            customChromaKey.b = d[2] / 255;
        }, 1000 * 2);
    }, (e) => console.error(e));
    // expose to  window.
    window["greenSttream"] = instance;
});
