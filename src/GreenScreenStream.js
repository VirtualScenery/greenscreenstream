"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenScreenStream = exports.GreenScreenMethod = void 0;
const demolishedrenderer_1 = require("demolishedrenderer");
const quantize_1 = __importDefault(require("quantize"));
const bodyPix = require('@tensorflow-models/body-pix');
require("@tensorflow/tfjs-backend-webgl");
require("@tensorflow/tfjs-backend-cpu");
var GreenScreenMethod;
(function (GreenScreenMethod) {
    GreenScreenMethod[GreenScreenMethod["Mask"] = 0] = "Mask";
    GreenScreenMethod[GreenScreenMethod["VirtualBackground"] = 1] = "VirtualBackground";
    GreenScreenMethod[GreenScreenMethod["VirtualBackgroundUsingGreenScreen"] = 2] = "VirtualBackgroundUsingGreenScreen";
})(GreenScreenMethod = exports.GreenScreenMethod || (exports.GreenScreenMethod = {}));
class GreenScreenStream {
    constructor(greenScreenMethod, canvas, width, height) {
        this.greenScreenMethod = greenScreenMethod;
        this.canvas = canvas;
        this.chromaKey = { r: 0.0, g: 0.6941176470588235, b: 0.25098039215686274 }; // { r: 0, g: 177, b: 64
        this.maskRange = { x: 0.0025, y: 0.26 };
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
        this.bufferVert = `layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
    `;
        this.bufferFrag = `uniform float time;
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
        this.mediaStream = new MediaStream();
        if (canvas) {
            this.canvas = canvas;
        }
        else {
            this.canvas = document.createElement("canvas");
            this.canvas.width = width || 640;
            this.canvas.height = height || 360;
        }
        if (greenScreenMethod !== GreenScreenMethod.VirtualBackgroundUsingGreenScreen)
            this.useML = true;
    }
    /**
     * Set up the rendering, texture etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<any>}
     * @memberof GreenScreenStream
     */
    setupRenderer(backgroundUrl) {
        const promise = new Promise((resolve, reject) => {
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
                                fn: (_prg, gl, texture) => {
                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, 6408, 6408, 5121, this.cameraSource);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                }
                            }
                        };
                    }
                    else {
                        textureSettings = {
                            "background": {
                                unit: 33985,
                                fn: (_prg, gl, texture) => {
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
                                fn: (_prg, gl, texture) => {
                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(3553, 0, 6408, 6408, 5121, this.cameraSource);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                }
                            }
                        };
                        this.backgroundSource.autoplay = true;
                        this.backgroundSource.loop = true;
                    }
                    this.backgroundSource.addEventListener(isImage ? "load" : "canplay", () => {
                        this.demolished = new demolishedrenderer_1.DR(this.canvas, this.mainVert, this.mainFrag);
                        this.demolished.aA(textureSettings, () => {
                            this.demolished.aB("A", this.mainVert, this.bufferFrag, ["background", "webcam"], {
                                "chromaKey": (location, gl, p, timestamp) => {
                                    gl.uniform4f(location, this.chromaKey.r, this.chromaKey.g, this.chromaKey.b, 1.);
                                },
                                "maskRange": (location, gl, p, timestamp) => {
                                    gl.uniform2f(location, this.maskRange.x, this.maskRange.y);
                                }
                            });
                            resolve(true);
                        });
                    });
                    this.backgroundSource.src = backgroundUrl;
                }
            }
            catch (error) {
                reject(error);
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
    setChromaKey(r, g, b) {
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
    setMaskRange(x, y) {
        this.maskRange.x = x;
        this.maskRange.y = y;
    }
    /**
     * Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack
     *
     * @returns {{ palette: any, dominant: any }}
     * @memberof GreenScreenStream
     */
    getColorsFromStream() {
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
        };
    }
    /**
     * Start render
     *
     * @memberof GreenScreenStream
     */
    start() {
        this.isRendering = true;
        if (this.greenScreenMethod === GreenScreenMethod.VirtualBackgroundUsingGreenScreen) {
            const update = (t) => {
                if (!this.isRendering)
                    return;
                this.rafId = requestAnimationFrame(update);
                this.demolished.R(t / 1000);
            };
            update(0); // kick first frame using WegGL ( User has a greenscreen )         
        }
        else {
            // how to render, use ML or just plan shader?
            if (this.greenScreenMethod === GreenScreenMethod.VirtualBackground) {
                let canvas = document.createElement("canvas");
                this.cameraSource = canvas;
                const update = (t) => {
                    if (!this.isRendering)
                        return;
                    this.model.segmentPerson(this.sourceVideo, this.segmentConfig).then((segmentation) => {
                        const maskedImage = bodyPix.toMask(segmentation, this.foregroundColor, this.backgroundColor);
                        bodyPix.drawMask(canvas, this.sourceVideo, maskedImage, this.opacity, this.maskBlurAmount, this.flipHorizontal);
                        this.rafId = requestAnimationFrame(update);
                        this.demolished.R(t / 1000);
                    }).catch(console.error);
                };
                update(0); // kick first frame and drawMask
            }
            else if (this.greenScreenMethod === GreenScreenMethod.Mask) {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const update = (t) => {
                    if (!this.isRendering)
                        return;
                    this.model.segmentPerson(this.sourceVideo, this.segmentConfig).then((segmentation) => {
                        const maskedImage = bodyPix.toMask(segmentation, this.foregroundColor, this.backgroundColor);
                        ctx.putImageData(maskedImage, 0, 0);
                        this.rafId = requestAnimationFrame(update);
                        this.demolished.R(t / 1000);
                    }).catch(console.error);
                };
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
    stop(stopMediaStreams) {
        this.isRendering = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = -1;
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
     * @return {*}  {Promise<GreenScreenStream>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl, config) {
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
        return new Promise((complted, rejected) => {
            this.setupRenderer(backgroundUrl).then(setupResult => {
                const p = new Promise((resolve, reject) => {
                    if (!this.demolished)
                        reject(`Now renderer created.Background image must be provided.`);
                    if (this.useML) {
                        bodyPix.load({
                            architecture: 'MobileNetV1',
                            outputStride: 16,
                            multiplier: 1,
                            quantBytes: 2
                        }).then((model) => {
                            this.model = model;
                            resolve(true);
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                    else {
                        // this.sourceVideo.onloadeddata = () => {  todo:  Refacor, 
                        resolve(true);
                        //}
                    }
                }).then(a => {
                    complted(this);
                }).catch(e => { rejected(e); });
            });
        });
    }
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track) {
        this.mediaStream.addTrack(track);
        this.sourceVideo = document.createElement("video");
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
    captureStream(fps) {
        return this.canvas["captureStream"](fps || 25);
    }
    pixelArray(pixels, pixelCount, quality) {
        const pixelArray = [];
        for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
            offset = i * 4;
            r = pixels[offset + 0];
            g = pixels[offset + 1];
            b = pixels[offset + 2];
            a = pixels[offset + 3];
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
    dominant(imageData, pixelCount) {
        const p = this.pallette(imageData, pixelCount);
        const d = p[0];
        return d;
    }
    ;
    /**
     * Get a pallette (10) of the most used colors in the imageData provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    pallette(imageData, pixelCount) {
        const pixelArray = this.pixelArray(imageData.data, pixelCount, 10);
        const cmap = quantize_1.default(pixelArray, 8);
        const palette = cmap ? cmap.palette() : null;
        return palette;
    }
    ;
}
exports.GreenScreenStream = GreenScreenStream;
