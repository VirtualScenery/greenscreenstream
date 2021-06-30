import { GreenScreenMethod } from "../..";
import {  GreenScreenStream } from "../../src/GreenScreenStream";

// thank you Aurélien Prunier
import awsomeShaderThingy from "./fractal.glsl";

document.addEventListener("DOMContentLoaded", () => {
  navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (mediaStream: MediaStream) => {

    const track= mediaStream.getVideoTracks()[0];

    
   
    const  cap = {w: track.getCapabilities().width as number , h:track.getConstraints().height as number};

    
    let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground,
      document.querySelector("canvas")
      , cap.w , cap.h);
    greenscreen.addVideoTrack(track);
    // override the default shader
    greenscreen.bufferFrag = awsomeShaderThingy;
    greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
      greenscreen.start();
      console.log("Starting");
      
    }).catch(e => {
      greenscreen.stop();
      console.error(e)}
      );
  }, (e) => console.error(e));
});