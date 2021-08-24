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
// thank you Aurélien Prunier
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
const green_screen_method_enum_1 = require("../../src/models/green-screen-method.enum");
const fractal_1 = require("./fractal");
document.addEventListener("DOMContentLoaded", () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then((mediaStream) => __awaiter(void 0, void 0, void 0, function* () {
        const track = mediaStream.getVideoTracks()[0];
        const cap = { w: track.getCapabilities().width, h: track.getConstraints().height };
        const target = document.querySelector("canvas");
        let greenscreen = new GreenScreenStream_1.GreenScreenStream(green_screen_method_enum_1.GreenScreenMethod.VirtualBackground, target, cap.w, cap.h);
        window["__instance"] = greenscreen;
        yield greenscreen.addVideoTrack(track);
        // override the default shader
        greenscreen.bufferFrag = fractal_1.FRACTAL;
        greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
            greenscreen.start(60);
            console.log("Starting");
        }).catch(e => {
            greenscreen.stop();
            console.error(e);
        });
    }), (e) => console.error(e));
});
//# sourceMappingURL=Procedual.js.map