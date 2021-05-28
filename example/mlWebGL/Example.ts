import { GreenScreenStream, GreenScreenMethod } from "../../src/GreenScreenStream";

document.addEventListener("DOMContentLoaded", () => {
    const bgfile = location.hash.length > 0 ? location.hash.replace("#", "") : "beach.jpg"
    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (ms: MediaStream) => {
        let instance = GreenScreenStream.getInstance(true, `../assets/${bgfile}`, undefined, 640, 360);
        instance.onReady = () => {
            const fps = 60;
            instance.initialize().then(result => {
                instance.start(GreenScreenMethod.VirtualBackground);
                const ms = instance.captureStream(fps); // capture result as a MediaSteam and attacj to video element
                document.querySelector("video").srcObject = ms;
            }).catch(err => {
                console.log(err);
            });
        }
        instance.addVideoTrack(ms.getVideoTracks()[0]);
        window["_instance"] = instance; // expose for debuging purposes
    }, (e) => console.error(e));
});