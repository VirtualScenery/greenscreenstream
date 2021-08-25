"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
const green_screen_method_enum_1 = require("../../src/models/green-screen-method.enum");
document.addEventListener("DOMContentLoaded", () => {
    let customChromaKey = {
        r: 0,
        g: 0,
        b: 0
    };
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then((mediaStream) => __awaiter(void 0, void 0, void 0, function* () {
        const track = mediaStream.getVideoTracks()[0];
        let instance = new GreenScreenStream_1.GreenScreenStream(green_screen_method_enum_1.GreenScreenMethod.VirtualBackgroundUsingGreenScreen, null, 640, 360);
        yield instance.addVideoTrack(track);
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
            instance.start(25);
            document.querySelector("video").srcObject = instance.captureStream(25);
            detectedColor.addEventListener("click", () => {
                instance.setChromaKey(customChromaKey.r, customChromaKey.g, customChromaKey.b);
            });
        }).catch(e => {
            instance.stop();
            console.error(e);
        });
    }), (e) => console.error(e));
});
//# sourceMappingURL=Example.js.map