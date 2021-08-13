
import { DR } from 'demolishedrenderer';
import quantize from 'quantize'

const bodyPix = require('@tensorflow-models/body-pix');
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu'
import { getBackend } from '@tensorflow/tfjs';

import { GreenScreenConfig } from './models/green-screen-config.interface';
import { MaskSettings } from './models/masksettings.interface';
import { BUFFER_FRAG, BUFFER_VERT, MAIN_FRAG, MAIN_VERT } from './models/glsl-constants';
import { TextureSettings } from './models/texturesettings.interface';
import { GreenScreenMethod } from './models/green-screen-method.enum';
import { BodyPixConfig } from './models/bodypix-config.interface';
import { getBodyPixMode } from './utils/get-bodypix-mode.util';
import { asyncCall } from './utils/async-call.util';

export class GreenScreenStream {
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

    mainFrag: string = MAIN_FRAG;

    mainVert: string = MAIN_VERT;

    bufferVert: string = BUFFER_VERT;

    bufferFrag: string = BUFFER_FRAG;

    constructor(public greenScreenMethod: GreenScreenMethod, public canvas?: HTMLCanvasElement, width: number = 640, height: number = 360) {
        this.mediaStream = new MediaStream();

        if (canvas)
            this.canvas = canvas;

        else {
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.canvas.width = width;
            this.canvas.height = height;
        }

        if (greenScreenMethod !== GreenScreenMethod.VirtualBackgroundUsingGreenScreen)
            this.useML = true;
    }

    /**
     * Set the background
     *
     * @param {string} src
     * @return {*}  {(Promise<HTMLImageElement | HTMLVideoElement | Error>)}
     * @memberof GreenScreenStream
     */
    setBackground(src: string): Promise<HTMLImageElement | HTMLVideoElement | Error> {
        return new Promise<any>((resolve, reject) => {
            const isImage = src.match(/\.(jpeg|jpg|png)$/) !== null;

            if (isImage) {
                const bg = new Image();
                bg.onerror = () => {
                    reject(new Error(`Unable to background image from ${src}`))
                };
                bg.onload = () => {
                    this.backgroundSource = bg;
                    resolve(bg);
                }
                bg.src = src;
            } else {
                const bg = document.createElement("video");
                bg.autoplay = true;
                bg.loop = true;
                bg.onerror = () => {
                    reject(new Error(`Unable to load background video from ${src}`))
                };
                bg.onloadeddata = () => {
                    this.backgroundSource = bg;
                    resolve(bg);
                }
                bg.src = src;
            }
        });
    }


    /**
     * Set up the rendering, texturesx etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<boolean | Error>}
     * @memberof GreenScreenStream
     */
    private setupRenderer(backgroundUrl: string): Promise<boolean | Error> {

        return new Promise<boolean | Error>(async (resolve, reject) => {

            this.ctx = this.canvas.getContext("webgl2");
            await this.setBackground(backgroundUrl).catch(err => {
                reject(err);
            });

            const textureSettings: TextureSettings = this.getTextureSettings();

            await this.prepareRenderer(textureSettings).catch(err => {
                reject(new Error("Cannot setup renderer"))
            });
            resolve(true);
        });
    }

    /**
     * Get the necessary texturesettings
     */
    private getTextureSettings(): TextureSettings {
        return {
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

    }

    /**
     * Instantiates & prepares the demolishedRenderer 
     * @param textureSettings
     */
    private prepareRenderer(textureSettings: TextureSettings): Promise<boolean | Error> {
        return new Promise<boolean | Error>( async(resolve, reject) => {
            try {

                this.demolished = new DR(this.canvas, this.mainVert, this.mainFrag);
                this.demolished.aA(
                    textureSettings
                    , () => {
                        this.demolished.aB(
                            "A",
                            this.mainVert,
                            this.bufferFrag,
                            ["background", "webcam"],
                            {
                                "chromaKey": (
                                    location: WebGLUniformLocation,
                                    gl: WebGLRenderingContext,
                                    p: WebGLProgram,
                                    timestamp: number
                                ) => {
                                    gl.uniform4f(
                                        location,
                                        this.chromaKey.r,
                                        this.chromaKey.g,
                                        this.chromaKey.b,
                                        1.
                                    )
                                },
                                "maskRange": (
                                    location: WebGLUniformLocation,
                                    gl: WebGLRenderingContext,
                                    p: WebGLProgram,
                                    timestamp: number
                                ) => {
                                    gl.uniform2f(
                                        location,
                                        this.maskRange.x,
                                        this.maskRange.y
                                    )
                                }
                            }
                        );
                        resolve(true);
                    });
            } catch (err) {
                reject(new Error(err));
            }

        });
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
        const canvas = document.createElement("canvas"); //need to declare it here because of scope

        switch (this.greenScreenMethod) {
            case GreenScreenMethod.VirtualBackgroundUsingGreenScreen:
                this.renderVirtualBackgroundGreenScreen(0);
                break;

            case GreenScreenMethod.VirtualBackground:
                this.cameraSource = canvas;
                this.renderVirtualBackground(0);
                break;

            case GreenScreenMethod.Mask:
                const ctx = canvas.getContext("2d");
                this.renderMask(0, ctx);
                break;
        }
    }

    /**
     * Renders a virtual background using a greenscreen
     * @param t 
     */
    private renderVirtualBackgroundGreenScreen(t: number): void {
        if (!this.isRendering)
            return;
        this.rafId = requestAnimationFrame(() => this.renderVirtualBackgroundGreenScreen(t));
        this.demolished.R(t / 1000)
    }

    /**
     * Renders a virtual background using ML
     * @param t 
     */
    private async renderVirtualBackground(t: number): Promise<void> {
        if (!this.isRendering)
            return;

        const { error, result } = await asyncCall(this.model.segmentPerson(this.sourceVideo, this.segmentConfig));
        if (error)
            return console.error(error);

        const maskedImage = bodyPix.toMask(result, this.foregroundColor, this.backgroundColor);

        bodyPix.drawMask(
            this.cameraSource,
            this.sourceVideo,
            maskedImage,
            this.opacity,
            this.maskBlurAmount,
            this.flipHorizontal
        );

        this.rafId = requestAnimationFrame((ts) => this.renderVirtualBackground(ts));
        this.demolished.R(t / 1000)
    }

    /**
     * Renders using a mask
     * @param t 
     * @param ctx 
     */
    private async renderMask(t: number, ctx: CanvasRenderingContext2D): Promise<void> {
        if (!this.isRendering)
            return;

        const { error, result } = await asyncCall(this.model.segmentPerson(this.sourceVideo, this.segmentConfig));
        if (error)
            return console.error(error);

        const maskedImage = bodyPix.toMask(result, this.foregroundColor, this.backgroundColor);
        ctx.putImageData(maskedImage, 0, 0);
        this.rafId = requestAnimationFrame((ts) => this.renderMask(ts, ctx));
        this.demolished.R(t / 1000);
    }

    /**
     * Stop renderer 
     * @param {boolean} [stopMediaStreams] 
     * @memberof GreenScreenStream
     */
    stop(stopMediaStreams?: boolean): void {
        this.isRendering = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = - 1;
        if (stopMediaStreams) {
            this.mediaStream.getVideoTracks().forEach(track => {
                track.stop();
            });
            this.ctx = null;
        }
    }

    /**
     * Initalize 
     * @param {string} [backgroundUrl]
     * @param {MaskSettings} [config]
     * @return {*}  {Promise<GreenScreenStream>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl?: string, config?: GreenScreenConfig): Promise<GreenScreenStream> {

        this.setConfig(config?.maskSettings);

        return new Promise<GreenScreenStream>(async (resolve, reject) => {

            let result = await asyncCall(this.setupRenderer(backgroundUrl));
            if (result.error)
                reject(result.error);

            if (!this.demolished)
                reject(`No renderer created. Background source must be provided.`);

            if (!this.useML)
                resolve(this);

            const model = await asyncCall(this.loadBodyPixModel(config));
            if (model.error)
                reject(model.error);

            console.log(model.result);
            this.model = model.result;
            resolve(this);
        });
    }

    /**
     * Applies the passed config or sets up a standard config when no config is provided on initialization
     */
    private setConfig(config?: MaskSettings): void {
        this.opacity = config?.opacity || 1.0;
        this.flipHorizontal = config?.flipHorizontal || true
        this.maskBlurAmount = config?.maskBlurAmount || 3;
        this.foregroundColor = config?.foregroundColor || { r: 255, g: 255, b: 255, a: 0 };
        this.backgroundColor = config?.backgroundColor || { r: 0, g: 177, b: 64, a: 255 };

        this.segmentConfig = {
            flipHorizontal: config?.segmentPerson.flipHorizontal || true,
            internalResolution: config?.segmentPerson.internalResolution || 'medium',
            segmentationThreshold: config?.segmentPerson.segmentationThreshold || 0.7,
            maxDetections: config?.segmentPerson.maxDetections || 1,
            quantBytes: config?.segmentPerson.quantBytes || 2
        };
        console.log(this.segmentConfig)
    }

    public async setBodyPixModel(config: GreenScreenConfig) {
        const model = await asyncCall(this.loadBodyPixModel(config));
        if (model.error)
            throw model.error;

        console.log(model.result);
        this.model = model.result;
    }

    /**
     * Sets up the bodypix model either via custom config or a preset.
     * If neither is provided, a default config is used.
     * @param config 
     */
    private async loadBodyPixModel(config: GreenScreenConfig) {
        let bodyPixMode: BodyPixConfig;
        console.log(config)
        if (config?.bodyPixConfig) {
            bodyPixMode = config?.bodyPixConfig;
            console.log("No config found. Fallining back to mode")
        }
        else {
            bodyPixMode = getBodyPixMode(config?.bodyPixMode);

        }

        return bodyPix.load(bodyPixMode);
    }

    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track: MediaStreamTrack) {
        return new Promise<void>((resolve, reject) => {
            this.mediaStream.addTrack(track);
            this.sourceVideo = document.createElement("video") as HTMLVideoElement;

            this.sourceVideo.width = this.canvas.width, this.sourceVideo.height = this.canvas.height;
            this.sourceVideo.autoplay = true;
            this.sourceVideo.srcObject = this.mediaStream;
            
            this.sourceVideo.onloadeddata = ()=> {
                this.sourceVideo.play();
                this.cameraSource = this.sourceVideo;
                resolve();
            }
        })
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