"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreenScreenStream_1 = require("../../src/GreenScreenStream");
document.addEventListener("DOMContentLoaded", () => {
    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (mediaStream) => {
        let greenscreen = new GreenScreenStream_1.GreenScreenStream(GreenScreenStream_1.GreenScreenMethod.VirtualBackground, undefined, 640, 360);
        greenscreen.addVideoTrack(mediaStream.getVideoTracks()[0]);
        // override the default shader
        greenscreen.bufferFrag = `
        uniform float time;
        uniform vec2 resolution;   
        uniform sampler2D webcam;
        uniform sampler2D background;
        uniform vec4 chromaKey; 
        uniform vec2 maskRange;

        out vec4 fragColor;

        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec2 mod289(vec2 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec3 permute(vec3 x) {
            return mod289(((x*34.0)+1.0)*x);
          }
          
          float snoise(vec2 v)
            {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                               -0.577350269189626,  // -1.0 + 2.0 * C.x
                                0.024390243902439); // 1.0 / 41.0
          // First corner
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
          
          // Other corners
            vec2 i1;
            //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
            //i1.y = 1.0 - i1.x;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            // x0 = x0 - 0.0 + 0.0 * C.xx ;
            // x1 = x0 - i1 + 1.0 * C.xx ;
            // x2 = x0 - 1.0 + 2.0 * C.xx ;
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
          
          // Permutations
            i = mod289(i); // Avoid truncation effects in permutation
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                  + i.x + vec3(0.0, i1.x, 1.0 ));
          
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
          
          // Gradients: 41 points uniformly over a line, mapped onto a diamond.
          // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
          
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
          
          // Normalise gradients implicitly by scaling m
          // Approximation of: m *= inversesqrt( a0*a0 + h*h );
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          
          // Compute final noise value at P
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          
          float rand(vec2 co)
          {
             return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
          }         
          

        void mainImage( out vec4 fragColor, in vec2 fragCoord )
            {
        
     
            vec2 uv = fragCoord.xy / resolution.xy;   
            uv.y = 1. -uv.y;                   

            // Create large, incidental noise waves
            float noise = max(0.0, snoise(vec2(time, uv.y * 0.1)) - 0.1) * (1.0 / 0.9);

            // Offset by smaller, constant noise waves
            noise = noise + (snoise(vec2(time*10.0, uv.y * 2.4)) - 0.5) * 0.15;            
            // Apply the noise as x displacement for every line
            float xpos = uv.x - noise * noise * 0.125;

            // to set a transparent background, use  vec4(0.,1.,0,.0);   
            vec4 bg = texture(background,uv); 
            fragColor = bg;      

            /*
            fragColor.g = mix(fragColor.r, texture(background, vec2(xpos + noise * 0.05, uv.y)).g, 0.25);
            fragColor.b = mix(fragColor.r, texture(background, vec2(xpos - noise * 0.05, uv.y)).b, 0.25);
            fragColor.rgb = mix(fragColor.rgb, vec3(rand(vec2(uv.y * time))), noise * 0.3).rgb;
            */

            vec4 manColor = texture(webcam, vec2(xpos, uv.y));
            //color of the greenscreen
            vec4 greenColor = vec4(0.0,177.0/255.0,64.0/255.0,1.0); 
            //compare manColor to greenColor
            float d = length(manColor.rgb - greenColor.rgb);
            //0.4 is the min distance to cut out
            if (d>0.4) 
               {
                   //blue tint greyscale
                   manColor.b = manColor.g = manColor.r * 1.5;                


                   // Apply a line pattern every 4 pixels
                   if (floor(mod(fragCoord.y * 0.25, 2.0)) == 0.0)
                   {
                    manColor.rgb *= 1.0 - (0.15 * noise);
                   }               

                   //apply man color slightly transparent
                   fragColor = mix(fragColor,manColor,.8);
                  
               }  

          


            }
            void main(){    
                mainImage(fragColor,gl_FragCoord.xy);      
            }        
        `;
        greenscreen.initialize(`../assets/mars.jpg`).then(state => {
            const fps = 60;
            // Instance.render(fps);
            // Capture the stream en send back to a video element
            greenscreen.start();
            const ms = greenscreen.captureStream(fps);
            document.querySelector("video").srcObject = ms;
        });
        // instance.onReady = () => {
        // }
        // // add the captured media stream ( video track )
    }, (e) => console.error(e));
});
