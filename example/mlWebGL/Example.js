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
const bodypixmode_enum_1 = require("../../src/models/bodypixmode.enum");
const green_screen_method_enum_1 = require("../../src/models/green-screen-method.enum");
let greenscreen;
document.addEventListener("DOMContentLoaded", () => startStream(bodypixmode_enum_1.GreenScreenStreamBodyPixMode.Standard));
function startStream(quality) {
    return __awaiter(this, void 0, void 0, function* () {
        const bgfile = location.hash.length > 0 ? location.hash.replace("#", "") : "beach.jpg";
        const inStream = yield navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false });
        const track = inStream.getVideoTracks()[0];
        greenscreen = new GreenScreenStream_1.GreenScreenStream(green_screen_method_enum_1.GreenScreenMethod.VirtualBackground, null, 640, 360);
        yield greenscreen.addVideoTrack(track);
        yield greenscreen.initialize(`../assets/${bgfile}`, { bodyPixMode: quality });
        greenscreen.start(60);
        const outStream = greenscreen.captureStream(60); // capture result as a MediaSteam and attacj to video element
        document.querySelector("video").srcObject = outStream;
        document.querySelector(".swap").classList.remove("hide");
        window["_instance"] = greenscreen; // expose for debuging purposes
    });
}
document.querySelectorAll(".swap-image").forEach(s => {
    s.addEventListener("click", (e) => {
        const src = e.target.dataset.src;
        greenscreen.setBackground(src);
    });
});
document.querySelectorAll(".swap-quality").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const mode = parseInt(e.target.dataset.mode);
        /**
         * 0 = Fast
         * 1 = Standard
         * 2 = Precise
         * 3 = Maximum
         */
        if (mode !== 3)
            return greenscreen.setBodyPixModel({ bodyPixMode: mode });
        const bConfirmed = window.confirm(`This setting might seriously stress your System. \n
            Loading might take a while.\n Continue?`);
        if (bConfirmed)
            greenscreen.setBodyPixModel({ bodyPixMode: mode });
    });
});
//# sourceMappingURL=Example.js.map