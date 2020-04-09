import { DR } from 'demolishedrenderer';
import quantize from 'quantize'

export class GreenScreenStream {

    canvas: HTMLCanvasElement;
    ctx: WebGL2RenderingContext;
    renderer: DR;
    mediaStream: MediaStream;
    video: HTMLVideoElement;

    private chromaKey = {r:0.05 ,g:0.63 ,b:0.14 }

    private maskRange = {x:0.005,y:0.26}


    private mainFrag: string = `uniform vec2 resolution;
    uniform sampler2D A;
    out vec4 fragColor;
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;        
        fragColor = texture(A, uv);
    }`;

    private mainVert: string = `layout(location = 0) in vec2 pos; 
    out vec4 fragColor;                
    void main() { 
        gl_Position = vec4(pos.xy,0.0,1.0);
    }    
    `;

    private bufferFrag: string = `uniform float time;
    uniform vec2 resolution;   
    uniform sampler2D webcam;
    uniform sampler2D background;
    uniform vec4 chromaKey; 
    uniform vec2 maskRange;
    out vec4 fragColor;

    mat4 RGBtoYUV = mat4(0.257,  0.439, -0.148, 0.0,
        0.504, -0.368, -0.291, 0.0,
        0.098, -0.071,  0.439, 0.0,
        0.0625, 0.500,  0.500, 1.0 );



float colorclose(vec3 yuv, vec3 keyYuv, vec2 tol)
{
float tmp = sqrt(pow(keyYuv.g - yuv.g, 2.0) + pow(keyYuv.b - yuv.b, 2.0));
if (tmp < tol.x)
return 0.0;
else if (tmp < tol.y)
return (tmp - tol.x)/(tol.y - tol.x);
else
return 1.0;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{ 
vec2 fragPos =  1. - fragCoord.xy / resolution.xy;
vec4 fg = texture(webcam, fragPos);
vec4 bg = texture(background, fragPos);

vec4 keyYUV =  RGBtoYUV * chromaKey;
vec4 yuv = RGBtoYUV * fg;

float mask = 1.0 - colorclose(yuv.rgb, keyYUV.rgb, maskRange);
fragColor = max(fg - mask * chromaKey, 0.0) + bg * mask;
}    

void main(){    
    mainImage(fragColor,gl_FragCoord.xy);      
}`;
    /**
     *Creates an instance of GreenScreenStream.
     * @param {string} backgroudImage backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optional.
     * @memberof GreenScreenStream
     */
    constructor(backgroudImage: string, canvas?: HTMLCanvasElement, width?: number, height?: number) {
        if (canvas) {
            this.canvas = canvas;
        } else {
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.canvas.width = width || 800; this.canvas.height = height || 450;
        }
        this.ctx = this.canvas.getContext("webgl2");
        this.mediaStream = new MediaStream();
        this.renderer = new DR(this.canvas, this.mainVert, this.mainFrag);
        
        this.renderer.aA(
            {
                "background": {
                    num: 33985,
                    src: backgroudImage
                },
                "webcam": {
                    num: 33984,
                    fn: (gl: WebGLRenderingContext, texture: WebGLTexture) => {
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        gl.texImage2D(3553, 0, 6408, 6408, 5121, this.video);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }
                }

            }, () => {
                this.renderer.aB("A", this.mainVert, this.bufferFrag, ["webcam", "background"],{
                    "chromaKey" : (location:WebGLUniformLocation,gl:WebGLRenderingContext, 
                        p:WebGLProgram, timestamp:number) => {

                            gl.uniform4f(location,this.chromaKey.r,
                                this.chromaKey.g, this.chromaKey.b, 1.)
                    },
                    "maskRange" : (location:WebGLUniformLocation,gl:WebGLRenderingContext, 
                        p:WebGLProgram, timestamp:number) => {

                            gl.uniform2f(location,this.maskRange.x,
                                this.maskRange.y)
                    }
                });
            });
    }
    /**
     * Set the color ro be removed 
     * i.e (0.05,0.63,0.14)
     * @param {number} r  0.0 - 1.0
     * @param {number} g 0.0 - 1.0
     * @param {number} b 0.0 - 1.0
     * @memberof GreenScreenStream
     */
    setChromaKey(r:number,g:number,b:number){
        this.chromaKey.r = r;
        this.chromaKey.g = g;
        this.chromaKey.b = b;         
    }
    /**
     * Range is used to decide the amount of color to be used from either foreground or background.
     * Playing with this variable will decide how much the foreground and background blend together.
     * @param {number} x
     * @param {number} y
     * @memberof GreenScreenStream
     */
    setMaskRange(x:number,y:number){
        this.maskRange.x  = x;
        this.maskRange.y = y;
    }
    /**
     * Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack
     *
     * @returns {{ palette: any, dominant: any }}
     * @memberof GreenScreenStream
     */
    getColorsFromStream(): { palette: any, dominant: any } {
        let glCanvas = this.canvas;
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = glCanvas.width;
        tempCanvas.height = glCanvas.height;
        let ctx = tempCanvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0);
        
        let imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  
        const pixels = this.canvas.width * this.canvas.height;

        return {
            palette: this.pallette(imageData, pixels),
            dominant: this.dominant(imageData, pixels)
        }

    }

    /**
     * Start render the new media stream
     *
     * @param {number} [fps] Frames per second
     * @memberof GreenScreenStream
     */
    render(fps?: number): void {
        this.renderer.run(0, fps || 25);
    }
    /**
     * Add a MediaStreamTrack track (i.e webcam ) 
     *
     * @param {MediaStreamTrack} track 
     * @memberof GreenScreenStream
     */
    addVideoTrack(track: MediaStreamTrack): void {
        this.mediaStream.addTrack(track);
        this.video = document.createElement("video") as HTMLVideoElement;
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
    captureStream(fps?: number): MediaStream {
        return this.canvas["captureStream"](fps || 25) as MediaStream;
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
    static getInstance(backgroudImage: string, canvas?: HTMLCanvasElement, width?: number, height?: number): GreenScreenStream {
        return new GreenScreenStream(backgroudImage, canvas, width, height);
    }

    private pixelArray(pixels: any, pixelCount: number, quality: number): Array<number> {
        const pixelArray = [];

        for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
            offset = i * 4;
            r = pixels[offset + 0];
            g = pixels[offset + 1];
            b = pixels[offset + 2];
            a = pixels[offset + 3]
            if (typeof a === 'undefined' || a >= 125) {
                if (!(r > 250 && g > 250 && b > 250)) {
                    pixelArray.push([r, g, b]);
                }
            }
        }

        return pixelArray;
    }
    /**
     *  Get the dominant color from the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    dominant(imageData: ImageData, pixelCount: number) {
        const p = this.pallette(imageData, pixelCount);
        const d = p[0];
        return d;
    };
    /**
     * Get a pallette (10) of the most used colors in the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    pallette(imageData: ImageData, pixelCount: number) {
        const pixelArray = this.pixelArray(imageData.data, pixelCount, 10);
        const cmap = quantize(pixelArray, 8);
        const palette = cmap ? cmap.palette() : null;
        return palette;
    };
}


