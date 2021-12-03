// thank you Aurélien Prunier
import { GreenScreenStream } from "../../src/GreenScreenStream";
import { GreenScreenStreamBodyPixMode } from "../../src/models/bodypixmode.enum";
import { GreenScreenMethod } from "../../src/models/green-screen-method.enum";


import { FRACTAL } from "./fractal";
document.addEventListener("DOMContentLoaded", () => {
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then(async (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    const cap = { w: track.getCapabilities().width as number, h: track.getConstraints().height as number };
    
    

    let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground, null, 640, 360);

    window["__instance"] = greenscreen;

    await greenscreen.addVideoTrack(track);
    // override the default shader
    greenscreen.bufferFrag = FRACTAL;
    greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
      greenscreen.start(60);
      const ms = greenscreen.captureStream(60);
      document.querySelector("video").srcObject = ms;

    }).catch(e => {
      greenscreen.stop();
      console.error(e)
    }
    );
  }, (e) => console.error(e));
});