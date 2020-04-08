"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedrenderer_1 = require("demolishedrenderer");
class GreenScreenStream {
    /**
     *Creates an instance of GreenScreenStream.
     * @param {string} backgroudImage backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optional.
     * @memberof GreenScreenStream
     */
    constructor(backgroudImage, canvas, width, height) {
        this.mainFrag = `uniform vec2 resolution;
    uniform sampler2D A;
    out vec4 fragColor;
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        
        fragColor = texture(A, uv);
    }`;
        this.mainVert = `layout(location = 0) in vec2 pos; 
    out vec4 fragColor;                
    void main() { 
        gl_Position = vec4(pos.xy,0.0,1.0);
    }    
    `;
        this.bufferFrag = `uniform float time;
    uniform vec2 resolution;   
    uniform sampler2D webcam;
    uniform sampler2D background;
    out vec4 fragColor;

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 q = 1. - fragCoord.xy / resolution.xy;
    
        vec3 bg = texture( background, q ).xyz;
        vec3 fg = texture( webcam, q ).xyz;
        
        
        float maxrb = max( fg.r, fg.b );
        
        float k = clamp( (fg.g-maxrb)*5.0, 0.0, 1.0 );
        
        
        float ll = length( fg );
        fg.g = min( fg.g, maxrb*0.8 );
        fg = ll*normalize(fg);
    
        fragColor = vec4( mix(fg, bg, k), 1.0 );
}

    void main(){    
        mainImage(fragColor,gl_FragCoord.xy);
      
    }`;
        if (canvas) {
            this.canvas = canvas;
        }
        else {
            this.canvas = document.createElement("canvas");
            this.canvas.width = width || 800;
            this.canvas.height = height || 450;
        }
        this.ctx = this.canvas.getContext("webgl2");
        this.mediaStream = new MediaStream();
        this.renderer = new demolishedrenderer_1.DR(this.canvas, this.mainVert, this.mainFrag);
        this.renderer.aA({
            "background": {
                num: 33985,
                src: backgroudImage
            },
            "webcam": {
                num: 33984,
                fn: (gl, texture) => {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(3553, 0, 6408, 6408, 5121, this.video);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            }
        }, () => {
            this.renderer.aB("A", this.mainVert, this.bufferFrag, ["webcam", "background"]);
        });
    }
    /**
     * Start render the new media stream
     *
     * @param {number} [fps] Frames per second
     * @memberof GreenScreenStream
     */
    render(fps) {
        this.renderer.run(0, fps || 25);
    }
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track) {
        this.mediaStream.addTrack(track);
        this.video = document.createElement("video");
        this.video.autoplay = true;
        this.video.srcObject = this.mediaStream;
        this.video.play();
    }
    /**
     * Capture the rendered result to a MediaStream
     *
     * @param {number} [fps] Frames per second
     * @returns {MediaStream}
     * @memberof GreenScreenStream
     */
    captureStream(fps) {
        return this.canvas["captureStream"](fps || 25);
    }
    /**
     *  Get an instance instance of GreenScreenStream.
     * @static
      * @param {string} backgroudImage backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optiona
     * @returns {GreenScreenStream}
     * @memberof GreenScreenStream
     */
    static getInstance(backgroudImage, canvas, width, height) {
        return new GreenScreenStream(backgroudImage, canvas, width, height);
    }
}
exports.GreenScreenStream = GreenScreenStream;
