import { GreenScreenStream, GreenScreenMethod } from "../../src/GreenScreenStream";

document.addEventListener("DOMContentLoaded", () => {
    const bgfile = location.hash.length > 0 ? location.hash.replace("#", "") : "beach.jpg"
    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (ms: MediaStream) => {
        let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground, undefined, 640, 360);
        greenscreen.addVideoTrack(ms.getVideoTracks()[0]);
        greenscreen.initialize(`../assets/${bgfile}`).then(result => {
            greenscreen.start();
            const ms = greenscreen.captureStream(60); // capture result as a MediaSteam and attacj to video element
            document.querySelector("video").srcObject = ms;
        }).catch(err => {
            console.log(err);
        });

        window["_instance"] = greenscreen; // expose for debuging purposes
    }, (e) => console.error(e));
});