import { GreenScreenStream, MaskSettings } from '../../src/GreenScreenStream';

document.addEventListener("DOMContentLoaded", () => {

    let instance = GreenScreenStream.getInstance(true, null, null, 800, 450);

    navigator.getUserMedia({ video: { width: 800, height: 450 }, audio: false }, (m: MediaStream) => {
        // Add the captured media stream ( video track )
        instance.addVideoTrack(m.getTracks()[0]);
        instance.getMask(document.querySelector("canvas"),
            {
                backgroundColor: { r: 0, g: 0, b: 0, a: 255 }
            } 
        );
    }, (e) => console.error(e));
    // expose to window.
    window["gss"] = instance;

});