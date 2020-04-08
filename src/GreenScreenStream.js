"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedrenderer_1 = require("demolishedrenderer");
class GreenScreenStream {
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
	const int samples = 10;
	const float dp = 0.1;
	float rad = 0.02;
    vec2 uv = 1. -fragCoord.xy / resolution.xy;

    vec4 fg = texture(webcam,uv);
	vec4 bg = texture(background,-uv);	
	vec3 blur = vec3(0.0);
	for (int i = -samples; i < samples; i++)
	{
		for (int j = -samples; j < samples; j++)
		{
			blur += texture(webcam, uv + vec2(i, j) * (rad/float(samples))).xyz
				 / pow(float(samples) * 2.0, 2.0);
		}
	}
	vec4 raw = vec4 (vec3(blur[1]-blur[0]),1.0);

	vec4 normal = clamp((1.0-(raw*10.0)),0.0,1.0);

	fg.g = clamp (fg.g, 0.0, fg.r-dp);


	fragColor = (normal * fg)+((1.0-normal) * bg);
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
    render(fps) {
        this.renderer.run(0, fps || 25);
    }
    addVideoTrack(track) {
        this.mediaStream.addTrack(track);
        this.video = document.createElement("video");
        this.video.autoplay = true;
        this.video.srcObject = this.mediaStream;
        this.video.play();
    }
    captureStream(fps) {
        return this.canvas["captureStream"](fps || 25);
    }
    static getInstance(backgroudImage, canvas, width, height) {
        return new GreenScreenStream(backgroudImage, canvas, width, height);
    }
}
exports.GreenScreenStream = GreenScreenStream;
