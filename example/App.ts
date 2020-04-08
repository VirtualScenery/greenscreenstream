import { GreenScreenStream } from "../src/GreenScreenStream";

document.addEventListener("DOMContentLoaded", () => {
    let instance = GreenScreenStream.getInstance("assets/palmtrees.jpg");

    navigator.getUserMedia({ video: true, audio: false }, (m: MediaStream) => {
        instance.addVideoTrack(m.getTracks()[0]);
        instance.render();

        document.querySelector("video").srcObject = instance.captureStream(25);

        const detectedColor = document.querySelector(".dominates") as HTMLElement;

        // detect color 2 / second
        setInterval(() => {
            let colors = instance.getColorsFromStream();
            let d = colors.dominant;
            //let p = colors.palette; // not displayed
            const s = `rgb(${d[0]},${d[1]},${d[2]}`;
            detectedColor.style.background = s;
        }, 1000 / 2); 

    }, (e) => console.error(e));

    // expose to  window.
    window["greatStream"] = instance;

});