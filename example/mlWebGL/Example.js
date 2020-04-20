"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    navigator.getUserMedia({ video: { width: 800, height: 450 }, audio: false }, (m) => {
        let instance = GreenScreenStream_1.GreenScreenStream.getInstance(true, "../assets/beach.jpg");
        // override the default shader
        instance.bufferFrag = `
        uniform float time;
        uniform vec2 resolution;   
        uniform sampler2D webcam;
        uniform sampler2D background;
        uniform vec4 chromaKey; 
        uniform vec2 maskRange;
        out vec4 fragColor;

        void mainImage( out vec4 fragColor, in vec2 fragCoord )
            {
                vec2 q = 1. -fragCoord.xy / resolution.xy;
                
                vec3 bg = texture( background, q ).xyz;
                vec3 fg = texture( webcam, q ).xyz;
                
                vec3 dom = vec3(0,1.0,0);
                
                float maxrb = max( fg.r, fg.b );
                
                float k = clamp( (fg.g-maxrb)*5.0, 0.0, 1.0 );
                

                float dg = fg.g; 
                
                fg.g = min( fg.g, maxrb*0.8 ); 
                
                fg += dg - fg.g;

                fragColor = vec4( mix(fg, bg, k), 1.0 );
            }

            void main(){    
                mainImage(fragColor,gl_FragCoord.xy);      
            }
        
        `;
        instance.onReady = () => {
            console.log("loaded");
            instance.render(25);
            document.querySelector("video").srcObject = instance.captureStream(25);
        };
        // add the captured media stream ( video track )
        instance.addVideoTrack(m.getTracks()[0]);
        window["gss"] = instance;
    }, (e) => console.error(e));
    // expose to  window.
});
