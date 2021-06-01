
import { DR } from 'demolishedrenderer';
import quantize from 'quantize'

const bodyPix = require('@tensorflow-models/body-pix');
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu'

export type MaskSettings = {
    opacity?: number,
    flipHorizontal?: boolean,
    maskBlurAmount?: number
    foregroundColor?: {
        r: number, g: number, b: number, a: number
    }
    backgroundColor?: {
        r: number, g: number, b: number, a: number
    }
    segmentPerson?: {
        flipHorizontal?: boolean,
        internalResolution?: string
        segmentationThreshold?: number
        maxDetections?: number
    }
};

export enum GreenScreenMethod {
    Mask = 0,
    VirtualBackground = 1,
    VirtualBackgroundUsingGreenScreen = 2
}


export class GreenScreenStream {
    canvas: HTMLCanvasElement;
    isRendering: boolean;
    rafId: number;
    opacity: any;
    flipHorizontal: any;
    maskBlurAmount: any;
    foregroundColor: any;
    backgroundColor: any;
    ctx: WebGL2RenderingContext;
    demolished: DR;
    mediaStream: MediaStream;
    model: any;
    private segmentConfig: any;
    private backgroundSource: any;
    private sourceVideo: HTMLVideoElement;
    private cameraSource: HTMLVideoElement | HTMLCanvasElement;
    private chromaKey = { r: 0.0, g: 0.6941176470588235, b: 0.25098039215686274 } // { r: 0, g: 177, b: 64
    private maskRange = { x: 0.0025, y: 0.26 }
    private useML: boolean;

    mainFrag: string = `uniform vec2 resolution;
    uniform sampler2D A;
    out vec4 fragColor;
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        fragColor = texture(A, uv);
    }`;

    mainVert: string = `layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
    `;
    bufferVert: string = `layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
    `;

    bufferFrag: string = `uniform float time;
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

constructor(public greenScreenMethod: GreenScreenMethod, canvas?: HTMLCanvasElement, width?: number, height?: number) {
        this.mediaStream = new MediaStream();

        if (canvas) {
            this.canvas = canvas;
        } else {
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.canvas.width = width || 640; this.canvas.height = height || 360;
        }

        if (greenScreenMethod !== GreenScreenMethod.VirtualBackgroundUsingGreenScreen) this.useML = true;

    }

    /**
     * set up the rendering, texture etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<any>}
     * @memberof GreenScreenStream
     */
    private setupRenderer(backgroundUrl?: string): Promise<any> {
        let promise = new Promise<any>((resolve, reject) => {
            try {
                this.ctx = this.canvas.getContext("webgl2");
                if (backgroundUrl) {
                    const isImage = backgroundUrl.match(/\.(jpeg|jpg|png)$/) !== null;
                    this.backgroundSource = isImage ?
                        new Image() : document.createElement("video");
                    let textureSettings = {};
                    if (isImage) {
                        textureSettings = {
                            "background": {
                                unit: 33985,
                                src: backgroundUrl
                            },
                            "webcam": {
                                unit: 33986,
                                fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, 6408, 6408, 5121, this.cameraSource);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                }
                            }

                        }
                    } else {
                        textureSettings = {
                            "background": {
                                unit: 33985,
                                fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(3553, 0, 6408, 6408, 5121, this.backgroundSource);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                }
                            },
                            "webcam": {
                                unit: 33986,
                                fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(3553, 0, 6408, 6408, 5121, this.cameraSource);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                }
                            }
                        }
                        this.backgroundSource.autoplay = true;
                        this.backgroundSource.loop = true;
                    }
                    this.backgroundSource.addEventListener(isImage ? "load" : "canplay", () => {

                        this.demolished = new DR(this.canvas, this.mainVert, this.mainFrag);
                        this.demolished.aA(
                            textureSettings
                            , () => {
                                this.demolished.aB("A", this.mainVert, this.bufferFrag, ["background", "webcam"], {
                                    "chromaKey": (location: WebGLUniformLocation, gl: WebGLRenderingContext,
                                        p: WebGLProgram, timestamp: number) => {
                                        gl.uniform4f(location, this.chromaKey.r,
                                            this.chromaKey.g, this.chromaKey.b, 1.)
                                    },
                                    "maskRange": (location: WebGLUniformLocation, gl: WebGLRenderingContext,
                                        p: WebGLProgram, timestamp: number) => {
                                        gl.uniform2f(location, this.maskRange.x,
                                            this.maskRange.y)
                                    }
                                });
                            });
                        resolve(true);

                    });
                    this.backgroundSource.src = backgroundUrl;
                }
            } catch (error) {
                reject(error)
            }

        });

        return promise;

    }
    /**
     * Set the color to be removed
     * i.e (0.05,0.63,0.14)
     * @param {number} r  0.0 - 1.0
     * @param {number} g 0.0 - 1.0
     * @param {number} b 0.0 - 1.0
     * @memberof GreenScreenStream
     */
    setChromaKey(r: number, g: number, b: number) {
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
    setMaskRange(x: number, y: number) {
        this.maskRange.x = x;
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
        ctx.drawImage(this.sourceVideo, 0, 0);

        let imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        const pixels = this.canvas.width * this.canvas.height;

        return {
            palette: this.pallette(imageData, pixels),
            dominant: this.dominant(imageData, pixels)
        }
    }
    /**
     * Start render
     *
     * @memberof GreenScreenStream
     */
    start() {
        this.isRendering = true;
        if (this.greenScreenMethod === GreenScreenMethod.VirtualBackgroundUsingGreenScreen) {
            const update = (t: number) => {
                if (!this.isRendering) return;
                this.rafId = requestAnimationFrame(update);
                this.demolished.R(t / 1000)
            }
            update(0); // kick first frame using WegGL ( User has a greenscreen )         
        } else {
            // how to render, use ML or just plan shader?
            if (this.greenScreenMethod === GreenScreenMethod.VirtualBackground) {
                let canvas = document.createElement("canvas");
                this.cameraSource = canvas;
                const update = (t: number) => {
                    if (!this.isRendering) return;
                    this.model.segmentPerson(this.sourceVideo, this.segmentConfig
                    ).then((segmentation: any) => {
                        const maskedImage = bodyPix.toMask(segmentation,
                            this.foregroundColor, this.backgroundColor);
                        bodyPix.drawMask(
                            canvas, this.sourceVideo, maskedImage, this.opacity,
                            this.maskBlurAmount,
                            this.flipHorizontal);
                        this.rafId = requestAnimationFrame(update);
                        this.demolished.R(t / 1000)

                    }).catch(console.error)
                }
                update(0); // kick first frame and drawMask
            } else if (this.greenScreenMethod === GreenScreenMethod.Mask) {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const update = (t: number) => {
                    if (!this.isRendering) return;
                    this.model.segmentPerson(this.sourceVideo, this.segmentConfig
                    ).then((segmentation: any) => {
                        const maskedImage = bodyPix.toMask(segmentation, this.foregroundColor, this.backgroundColor);
                        ctx.putImageData(maskedImage, 0, 0);
                        this.rafId = requestAnimationFrame(update);
                        this.demolished.R(t / 1000)
                    }).catch(console.error);
                }
                update(0); // kick first frame toMask
            }
        }

    }
   
    /**
     * Stop renderer 
     *
     * @param {boolean} [stopMediaStreams] 
     * @memberof GreenScreenStream
     */
    stop(stopMediaStreams?: boolean) {
        this.isRendering = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = - 1;
        if (stopMediaStreams) {
            this.mediaStream.getVideoTracks().forEach(t => {
                t.stop();
            });
        }
    }


    /**
     * Initalize
     *
     * @param {string} [backgroundUrl]
     * @param {MaskSettings} [config]
     * @return {*}  {Promise<boolean>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl?: string, config?: MaskSettings): Promise<boolean> {
        const promise = new Promise<boolean>((initializeCompleted, initializeFailed) => {
            this.setupRenderer(backgroundUrl).then(r => {
                if (!config) {
                    this.opacity = 1.0;
                    this.flipHorizontal = true;
                    this.maskBlurAmount = 3;
                    this.foregroundColor = { r: 255, g: 255, b: 255, a: 0 };
                    this.backgroundColor = { r: 0, g: 177, b: 64, a: 255 };
                    this.segmentConfig = {
                        flipHorizontal: true,
                        internalResolution: 'medium',
                        segmentationThreshold: 0.7,
                        maxDetections: 1,
                        quantBytes: 2
                    };
                }

                const p = new Promise<boolean>((resolve, reject) => {
                    if (!this.demolished) reject(`Now renderer created.Background image must be provided.`);
                    console.info(`GreenScreenStream using:${this.useML}`);
                    if (this.useML) {
                        bodyPix.load({
                            architecture: 'MobileNetV1',
                            outputStride: 16,
                            multiplier: 1,
                            quantBytes: 2
                        }).then((model: any) => {
                            this.model = model;
                            resolve(true);
                        }).catch(err => {
                            reject(err);
                        });
                    } else {
                        this.sourceVideo.onloadeddata = () => {
                            resolve(true);
                        }
                    }
                });

                p.then(r => {
                    initializeCompleted(true);
                }).catch(err => {
                    console.error(err);
                    initializeFailed(err);
                })

            });


        });



        return promise;



    }
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track: MediaStreamTrack): void {
        this.mediaStream.addTrack(track);
        this.sourceVideo = document.createElement("video") as HTMLVideoElement;
        this.sourceVideo.width = this.canvas.width, this.sourceVideo.height = this.canvas.height;
        this.sourceVideo.autoplay = true;
        this.sourceVideo.srcObject = this.mediaStream;
        this.sourceVideo.play();
        this.cameraSource = this.sourceVideo;
    }
    /**
     * Capture the rendered result to a MediaStream
     *
     * @param {number} [fps]
     * @returns {MediaStream}
     * @memberof GreenScreenStream
     */
    captureStream(fps?: number): MediaStream {
        return this.canvas["captureStream"](fps || 25) as MediaStream;
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
     *  Get the dominant color from the imageData provided
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
     * Get a pallette (10) of the most used colors in the imageData provided
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


