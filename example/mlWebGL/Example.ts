import { GreenScreenStream } from "../../src/GreenScreenStream";

document.addEventListener("DOMContentLoaded", () => {



    const bgfile = location.hash.length > 0 ? location.hash.replace("#", "") : "beach.jpg"

    navigator.getUserMedia({ video: { width: 640, height: 360 }, audio: false }, (mediaStream: MediaStream) => {
        // get an instance of the GreenScreen stream
        
        let instance = GreenScreenStream.getInstance(true, `../assets/${bgfile}`, undefined, 640, 360);
        
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
                vec3 bg = texture(webcam,q).xyz;
                vec3 fg = texture(background, q ).xyz;                
                vec3 dom = vec3(0,0.6941176470588235,0.25098039215686274);                
                float maxrb = max( fg.r, fg.b );                
                float k = clamp( (fg.g-maxrb)*5.0, 0.0, 1.0 );
                float dg = fg.g;                 
                fg.g = min( fg.g, maxrb*0.8 ); 
                fg += dg - fg.g;
                fragColor = vec4(mix(fg, bg, k), 1. );
            }
            void main(){    
                mainImage(fragColor,gl_FragCoord.xy);      
            }        
        `

        instance.onReady = () => {
            const fps = 25;
            instance.render(fps);
            // capture the stream en send back to a video element
            const ms = instance.captureStream(fps);
            document.querySelector("video").srcObject = ms;
        }
        // add the captured media stream ( video track )
        instance.addVideoTrack(mediaStream.getTracks()[0]);

        window["gss"] = instance; // expose for debuging purposes

    }, (e) => console.error(e));

});