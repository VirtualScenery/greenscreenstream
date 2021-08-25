import { GreenScreenStream } from "../../src/GreenScreenStream";
import { GreenScreenMethod } from "../../src/models/green-screen-method.enum";


document.addEventListener("DOMContentLoaded", () => {
   
    let customChromaKey = {
        r: 0,
        g: 0,
        b: 0
    }

 
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then( async(mediaStream: MediaStream) => {

        const track = mediaStream.getVideoTracks()[0];

        
        let instance = new GreenScreenStream(GreenScreenMethod.VirtualBackgroundUsingGreenScreen,null,640,360);

        await instance.addVideoTrack(track);

        instance.initialize("../assets/beach.jpg").then(result => {
            const detectedColor = document.querySelector(".dominates") as HTMLElement;
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

        }).catch ( e => {
            instance.stop();
            console.error(e);
        });



    }, (e) => console.error(e));



   
});