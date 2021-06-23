
import { DR } from 'demolishedrenderer';
import quantize from 'quantize'

const bodyPix = require('@tensorflow-models/body-pix');
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu'

import bufferFragmentShader from "./glsl/buffer-frag.glsl";
import bufferVertexShader from "./glsl/buffer-vert.glsl";
import mainVertexShader from './glsl/main-vert.glsl';
import mainFragmentShader from './glsl/main-frag.glsl';
import { MaskSettings } from './masksettings.type';
import {
    getImageTextureSettings,
    getVideoTextureSettings,
    ImageTextureSettings,
    VideoTextureSettings
} from './texturesettings';
import { asyncCall } from './async-call.util';

export enum GreenScreenMethod {
    Mask = 0,
    VirtualBackground = 1,
    VirtualBackgroundUsingGreenScreen = 2
}

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

    mainFrag: string = mainFragmentShader;

    mainVert: string = mainVertexShader;

    bufferVert: string = bufferVertexShader;

    bufferFrag: string = bufferFragmentShader;

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
     * Set up the rendering, textures, etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<boolean | Error>}
     * @memberof GreenScreenStream
     */
    private setupRenderer(backgroundUrl?: string): Promise<boolean | Error> {

        return new Promise<boolean | Error>(async (resolve, reject) => {
            try {
                this.ctx = this.canvas.getContext("webgl2");
                let textureSettings: ImageTextureSettings | VideoTextureSettings;

                // What should happen in this instance? Throw an error? Promise would never get resolved or rejected in previous implementation
                if (!backgroundUrl)
                    resolve(false);

                const isImage = backgroundUrl.match(/\.(jpeg|jpg|png)$/) !== null;
                this.backgroundSource = isImage ? new Image() : document.createElement("video");

                if (isImage)
                    textureSettings = getImageTextureSettings(backgroundUrl, this.cameraSource);

                else {
                    textureSettings = getVideoTextureSettings(this.backgroundSource, this.cameraSource);

                    this.backgroundSource.autoplay = true;
                    this.backgroundSource.loop = true;
                }

                this.backgroundSource.src = backgroundUrl;
                await this.onSourceLoaded(isImage);
                await this.prepareRenderer(textureSettings);

                resolve(true);

            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Adds a event listener to the background source that determines if it's loaded.
     * @param isImage determines if the current background source is an image or a video.
     * @Returns a promise that resolves as soon as resource is loaded.
     */
    private onSourceLoaded(isImage: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            this.backgroundSource.addEventListener(isImage ? "load" : "canplay", () => {
                resolve();
            });
        });
    }

    /**
     * Instantiates & prepares the demolishedRenderer 
     * @param textureSettings
     * @returns 
     */
    private prepareRenderer(textureSettings: ImageTextureSettings | VideoTextureSettings): Promise<void> {
        return new Promise((resolve, reject) => {
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
                    resolve();
                });
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

        this.rafId = requestAnimationFrame(() => this.renderVirtualBackground(t));
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
        this.rafId = requestAnimationFrame(() => this.renderMask(t, ctx));
        this.demolished.R(t / 1000);
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
     * @return {*}  {Promise<GreenScreenStream>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl?: string, config?: MaskSettings): Promise<GreenScreenStream> {

        if (!config) 
            this.setBaseConfig();

        return new Promise<GreenScreenStream>( async (complted, rejected) => {

            let { error, result } = await asyncCall(this.setupRenderer(backgroundUrl));

            if(error)
                rejected(error);

            if (!this.demolished) 
                rejected(`No renderer created.Background image must be provided.`);
            
            if(!this.useML)
                complted(this);

            ({ error, result } = await asyncCall(
                bodyPix.load({
                    architecture: 'MobileNetV1',
                    outputStride: 16,
                    multiplier: 1,
                    quantBytes: 2
                })
            ));

            if(error)
                rejected(error);
            
            this.model = result;
            complted(this);
        });
    }

    /**
     * Sets up a standard config when no config is provided on initialization
     */
    private setBaseConfig(): void {
        this.opacity = 1.0;
        this.flipHorizontal = true
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