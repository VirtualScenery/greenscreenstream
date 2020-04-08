import { GreenScreenStream } from "../src/GreenScreenStream";

document.addEventListener("DOMContentLoaded", () => {
    let instance = GreenScreenStream.getInstance("assets/palmtrees.jpg");

    navigator.getUserMedia({ video: true, audio: false }, (m: MediaStream) => {
        instance.addVideoTrack(m.getTracks()[0]);
        instance.render();

        document.querySelector("video").srcObject = instance.captureStream(25);


    }, (e) => console.error(e));

    // expose to  window.
    window["greatStream"] = instance;

});