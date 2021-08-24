// thank you Aurélien Prunier
import { GreenScreenStream } from "../../src/GreenScreenStream";
import { GreenScreenMethod } from "../../src/models/green-screen-method.enum";
import { FRACTAL } from "./fractal";
document.addEventListener("DOMContentLoaded", () => {
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then(async (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    const cap = { w: track.getCapabilities().width as number, h: track.getConstraints().height as number };
    const target = document.querySelector("canvas");
    let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground, target, cap.w, cap.h);

    window["__instance"] = greenscreen;

    await greenscreen.addVideoTrack(track);
    // override the default shader
    greenscreen.bufferFrag = FRACTAL;
    greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
      greenscreen.start(60);
      console.log("Starting");

    }).catch(e => {
      greenscreen.stop();
      console.error(e)
    }
    );
  }, (e) => console.error(e));
});