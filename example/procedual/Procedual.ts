import { GreenScreenMethod, GreenScreenStream } from "../../src/GreenScreenStream";

// thank you Aurélien Prunier
import awsomeShaderThiny from "./fractal.glsl";

document.addEventListener("DOMContentLoaded", () => {
  navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (mediaStream: MediaStream) => {
    let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground,
      document.querySelector("canvas")
      , 640, 360);
    greenscreen.addVideoTrack(mediaStream.getVideoTracks()[0]);
    // override the default shader
    greenscreen.bufferFrag = awsomeShaderThiny;
    greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
      greenscreen.start();

    }).catch(e => {
      greenscreen.stop();
      console.error(e)}
      );
  }, (e) => console.error(e));
});