
import { GreenScreenMethod } from 'dist/src/models/green-screen-method.enum';
import { GreenScreenStream } from "dist/src/GreenScreenStream";

// thank you Aurélien Prunier
import { FRACTAL } from "./fractal";

document.addEventListener("DOMContentLoaded", () => {
  
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false }).then( async (mediaStream: MediaStream) => {

    const track= mediaStream.getVideoTracks()[0];    
   
    const  cap = {w: track.getCapabilities().width as number , h:track.getConstraints().height as number};

    
    let greenscreen = new GreenScreenStream(GreenScreenMethod.VirtualBackground,
      document.querySelector("canvas")
      , cap.w , cap.h);
      
    await greenscreen.addVideoTrack(track);
    // override the default shader
    greenscreen.bufferFrag = FRACTAL;
    greenscreen.initialize(`../assets/iChannel0.png`).then(state => {
      greenscreen.start();
      console.log("Starting");
      
    }).catch(e => {
      greenscreen.stop();
      console.error(e)}
      );
  }, (e) => console.error(e));
});