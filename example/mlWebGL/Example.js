"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodypixmode_enum_1 = require("./../../src/models/bodypixmode.enum");
const green_screen_method_enum_1 = require("./../../src/models/green-screen-method.enum");
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    const bgfile = location.hash.length > 0 ? location.hash.replace("#", "") : "beach.jpg";
    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (ms) => {
        let greenscreen = new GreenScreenStream_1.GreenScreenStream(green_screen_method_enum_1.GreenScreenMethod.VirtualBackground, undefined, 640, 360);
        greenscreen.addVideoTrack(ms.getVideoTracks()[0]);
        //     greenscreen.bufferFrag = `uniform float time;
        //     uniform vec2 resolution;   
        //     uniform sampler2D webcam;
        //     uniform sampler2D background;
        //     uniform vec4 chromaKey; 
        //     uniform vec2 maskRange;
        //     out vec4 fragColor;
        // void mainImage( out vec4 fragColor, in vec2 fragCoord )
        // {
        // vec2 q = 1. - fragCoord.xy / resolution.xy;
        // vec3 bg = texture( background, q ).xyz;
        // vec3 fg = texture( webcam, q ).xyz;
        // float maxrb = max( fg.r, fg.b );
        // float k = clamp( (fg.g-maxrb)*5.0, 0.0, 1.0 );
        // float dg = fg.g; 
        // fg.g = min( fg.g, maxrb*0.8 ); 
        // fg += dg - fg.g;
        // fragColor = vec4( mix(fg, bg, k), 1.0 );
        // }
        // void main(){    
        //     mainImage(fragColor,gl_FragCoord.xy);      
        // }  
        //     `;
        greenscreen.initialize(`../assets/${bgfile}`, { bodyPixMode: bodypixmode_enum_1.BodyPixMode.Maximum }).then(result => {
            greenscreen.start();
            const ms = greenscreen.captureStream(60); // capture result as a MediaSteam and attacj to video element
            document.querySelector("video").srcObject = ms;
            document.querySelector(".swap").classList.remove("hide");
            document.querySelectorAll(".swap-image").forEach(s => {
                s.addEventListener("click", (e) => {
                    const src = e.target.dataset.src;
                    greenscreen.setBackground(src);
                });
            });
        }).catch(err => {
            console.log(err);
        });
        window["_instance"] = greenscreen; // expose for debuging purposes
    }, (e) => console.error(e));
});
//# sourceMappingURL=Example.js.map