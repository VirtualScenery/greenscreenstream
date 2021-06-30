"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    let customChromaKey = {
        r: 0,
        g: 0,
        b: 0
    };
    let instance = new GreenScreenStream_1.GreenScreenStream(__1.GreenScreenMethod.VirtualBackgroundUsingGreenScreen);
    navigator.getUserMedia({ video: { width: 800, height: 450 }, audio: false }, (m) => {
        instance.addVideoTrack(m.getVideoTracks()[0]);
        instance.initialize("../assets/beach.jpg").then(result => {
            const detectedColor = document.querySelector(".dominates");
            detectedColor.addEventListener("click", () => {
                instance.setChromaKey(customChromaKey.r, customChromaKey.g, customChromaKey.b);
            });
            // detect color 2 / second
            const interrval = setInterval(() => {
                let colors = instance.getColorsFromStream();
                let d = colors.dominant;
                //let p = colors.palette; // not displayed
                const s = `rgb(${d[0]},${d[1]},${d[2]}`;
                detectedColor.style.background = s;
                customChromaKey.r = d[0] / 255;
                customChromaKey.g = d[1] / 255;
                customChromaKey.b = d[2] / 255;
            }, 1000 * 2);
            instance.start();
            document.querySelector("video").srcObject = instance.captureStream(25);
            detectedColor.addEventListener("click", () => {
                instance.setChromaKey(customChromaKey.r, customChromaKey.g, customChromaKey.b);
            });
        }).catch(e => {
            instance.stop();
            console.error(e);
        });
    }, (e) => console.error(e));
    window["_instance"] = instance;
});
//# sourceMappingURL=Example.js.map