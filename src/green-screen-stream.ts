import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

import quantize from 'quantize';

import * as BODY_PIX from '@tensorflow-models/body-pix';
import {
  BodyPix,
  load,
} from '@tensorflow-models/body-pix';
import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';

import { GreenScreenMethod } from './models/enums/green-screen-method.enum';
import { VideoResolution } from './models/enums/video-resolution.enum';
import {
  BUFFER_FRAG,
  BUFFER_VERT,
  MAIN_FRAG,
  MAIN_VERT,
} from './models/glsl-constants';
import { IGreenScreenConfig } from './models/green-screen-config.interface';
import {
  DEFAULT_MASK_SETTINGS,
  IMaskSettings,
  RGBA,
} from './models/masksettings.interface';
import { ITextureSettings } from './models/texturesettings.interface';
import { Vector2 } from './models/vector2';
import { DemolishedRenderer } from './renderer/webgl/DemolishedRenderer';
import { getBodyPixMode } from './utils/get-bodypix-mode.util';
import { resolutionFromEnum } from './utils/resolution-from-enum.util';

/**
 * The `GreenScreenStream` class provides a virtual background solution for video streams,
 * supporting both chroma key (green screen) and machine learning-based background segmentation.
 * It manages video sources, background images or videos, and rendering via WebGL, and can output
 * the processed stream as a MediaStream suitable for use in web applications.
 *
 * Features:
 * - Supports chroma key (green screen) and ML-based segmentation (BodyPix).
 * - Allows dynamic background replacement with images or videos.
 * - Provides methods to start/stop rendering, add video tracks, and capture the output stream.
 * - Offers color analysis utilities (dominant color, palette extraction).
 * - Configurable mask, chroma key, and rendering settings.
 * - Integrates with WebGL for efficient real-time compositing.
 *
 * Usage:
 * 1. Instantiate with the desired green screen method and resolution.
 * 2. Call `initialize()` with a background source and optional configuration.
 * 3. Add a video track (e.g., from a webcam) using `addVideoTrack()`.
 * 4. Start rendering with `start()`.
 * 5. Capture the processed stream via `captureStream()`.
 * 6. Stop rendering with `stop()`.
 *
 * @example
 * ```typescript
 * const gss = new GreenScreenStream(GreenScreenMethod.VirtualBackground, { x: 1280, y: 720 });
 * await gss.initialize('background.jpg');
 * await gss.addVideoTrack(webcamTrack);
 * gss.start();
 * const outputStream = gss.captureStream();
 * ```
 *
 * @public
 */
export class GreenScreenStream {
    isRendering: boolean;
    frame: number = -1;
    rafId: number;
    startTime: number = null;
    opacity: number;
    flipHorizontal: boolean;
    maskBlurAmount: number;
    foregroundColor: RGBA;
    backgroundColor: RGBA;
    ctx: WebGLRenderingContext | WebGL2RenderingContext;
    demolished: DemolishedRenderer;
    mediaStream: MediaStream;
    bodyPix: BodyPix;
    backgroundSource: HTMLImageElement | HTMLVideoElement;
    resolution: Vector2

    private segmentConfig: any;
    private sourceVideo: HTMLVideoElement;
    private cameraSource: HTMLVideoElement | HTMLCanvasElement;
    private chromaKey = { r: 0.0, g: 0.6941176470588235, b: 0.25098039215686274 } // { r: 0, g: 177, b: 64
    private maskRange = { x: 0.0025, y: 0.26 }
    private useML: boolean;

    mainFrag: string = MAIN_FRAG;
    mainVert: string = MAIN_VERT;
    bufferVert: string = BUFFER_VERT;
    bufferFrag: string = BUFFER_FRAG;
    maxFps: number;
    canvas: HTMLCanvasElement
    modelLoaded: boolean;

    /**
     * Constructs a new instance of the green screen stream handler.
     *
     * @param greenScreenMethod - The method to use for green screen processing.
     * @param resolution - The desired video resolution or a vector specifying width and height.
     * @param canvasEl - (Optional) An existing HTMLCanvasElement to use for rendering. If not provided, a new canvas will be created.
     *
     * Initializes the media stream and canvas, sets the canvas resolution, and determines whether to use machine learning-based background removal based on the selected green screen method.
     */
    constructor(public greenScreenMethod: GreenScreenMethod,  resolution: VideoResolution | Vector2, public canvasEl?: HTMLCanvasElement) {
        this.mediaStream = new MediaStream();
        if (canvasEl)
            this.canvas = canvasEl;
        else
            this.canvas = document.createElement("canvas");

        this.setCanvasResolution(resolution);
        if (greenScreenMethod !== GreenScreenMethod.VirtualBackgroundUsingGreenScreen)
            this.useML = true;
    }

    //#region Public Methods

    /**
     * Initializes the green screen stream with a background source and optional configuration.
     *
     * @param {string} backgroundUrl - The URL of the background image or video to use.
     * @param {IGreenScreenConfig} [config] - Optional configuration settings for the green screen.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     * @throws {Error} If no renderer is created or if the background source is invalid.
     * @memberof GreenScreenStream
     */
    public async initialize(backgroundUrl: string, config?: IGreenScreenConfig): Promise<void> {

        this.setConfig(config?.maskSettings);

        await this.setupRenderer(backgroundUrl);

        if (!this.demolished)
            throw new Error(`No renderer created. Valid Background source must be provided.`);
        if (!this.useML)
            return;

        const model = await this.loadBodyPixModel(config);

        this.bodyPix = model;
        this.modelLoaded = true;
    }

    /**
     * Start the rendering process with an optional maximum frames per second (maxFps).
     * If maxFps is not provided, defaults to 25.
     *
     * @param {number} [maxFps] - The maximum frames per second for rendering.
     * @memberof GreenScreenStream
     */    
    public start(maxFps?: number): void {
        this.maxFps = maxFps || 25;
        this.isRendering = true;
        const canvas = document.createElement("canvas");
        switch (this.greenScreenMethod) {

            case GreenScreenMethod.VirtualBackground:
                this.cameraSource = canvas;
                this.renderVirtualBackground(0);
                break;

            case GreenScreenMethod.VirtualBackgroundUsingGreenScreen:
                this.renderVirtualBackgroundGreenScreen(0);
                break;

        }
    }

    /**
     * Stops the rendering process and optionally stops the media streams.
     *
     * @param {boolean} [stopMediaStreams=true] - Whether to stop the media streams (default is true).
     * @memberof GreenScreenStream
     */
    public stop(stopMediaStreams?: boolean): void {
        this.isRendering = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = - 1;
        if (stopMediaStreams) {
            this.mediaStream.getVideoTracks().forEach(track => {
                track.stop();
            });
            this.mediaStream = null;
            this.ctx = null;
        }
        this.startTime = null;
        this.frame = -1;
    }

    /**
     * Adds a video track to the media stream and sets up the source video element.
     *
     * @param {MediaStreamTrack} track - The video track to add.
     * @returns {Promise<void | any>} A promise that resolves when the track is added and the source video is ready.
     * @memberof GreenScreenStream
     */
   
    public addVideoTrack(track: MediaStreamTrack): Promise<void | any> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.mediaStream.addTrack(track);
                this.sourceVideo = document.createElement("video");
                this.sourceVideo.width = this.canvas.width;
                this.sourceVideo.height = this.canvas.height;
                this.sourceVideo.autoplay = true;
                this.sourceVideo.srcObject = this.mediaStream;

                this.sourceVideo.onloadeddata = () => {
                    this.sourceVideo.play();
                    this.cameraSource = this.sourceVideo;
                    resolve();
                }
                this.sourceVideo.onerror = (err) => reject(err);
            }
            catch (error) { reject(error) }
        })
    }

    /**
     * Captures the current state of the canvas as a MediaStream.
     * Optionally, you can specify the frames per second (fps) for the captured stream.
     *
     * @param {number} [fps=25] - The frames per second for the captured stream (default is 25).
     * @returns {MediaStream} The captured MediaStream from the canvas.
     * @memberof GreenScreenStream
     */
  
    public captureStream(fps?: number): MediaStream {
        return this.canvas["captureStream"](fps || 25) as MediaStream;
    }

    /**
     * Sets the background image or video for the green screen.
     * Returns a promise that resolves with the loaded background element (HTMLImageElement or HTMLVideoElement).
     *
     * @param {string} src - The source URL of the background image or video.
     * @returns {Promise<HTMLImageElement | HTMLVideoElement>} A promise that resolves with the loaded background element.
     * @memberof GreenScreenStream
     */

    public setBackground(src: string): Promise<HTMLImageElement | HTMLVideoElement> {
        const bIsImage = this.getIsImage(src);
        let bg: HTMLImageElement | HTMLVideoElement;

        return new Promise<HTMLImageElement | HTMLVideoElement>((resolve, reject) => {

            if (bIsImage) {
                bg = new Image();

                bg.onerror = (error) => reject(new Error(`Unable to load background from ${src}\n${error}`));
                bg.onload = async () => {
                    bg = await this.scaleImageToCanvas(bg as HTMLImageElement);
                    resolve(bg);
                }
            }
            else {
                bg = document.createElement("video");

                bg.autoplay = true;
                bg.loop = true;

                bg.onerror = (error) => reject(new Error(`Unable to load background from  ${src}\n${error}`));
                bg.onloadeddata = () => resolve(bg);           
            }
            bg.src = src;
            this.backgroundSource = bg;
        });
    }

    /**
     * Scales the provided image to fit the canvas dimensions.
     * Returns a promise that resolves with the scaled HTMLImageElement.
     *
     * @param {HTMLImageElement} image - The image to scale.
     * @param {ImageBitmapOptions} [imageOptions] - Optional options for creating the image bitmap.
     * @returns {Promise<HTMLImageElement>} A promise that resolves with the scaled image.
     * @memberof GreenScreenStream
     */
    
    public async scaleImageToCanvas(image: HTMLImageElement, imageOptions?: ImageBitmapOptions): Promise<HTMLImageElement> {

        if(!imageOptions)
            imageOptions = {
                resizeWidth: this.canvas.width,
                resizeHeight: this.canvas.height,
                resizeQuality: 'high'
            };

        const imageBitmap = await createImageBitmap(image, imageOptions);

        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        const ctx = canvas.getContext('bitmaprenderer');
        ctx.transferFromImageBitmap(imageBitmap);

        const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve));

        const scaledImage = new Image();
        scaledImage.src = URL.createObjectURL(blob);
        return scaledImage;
    }

    /**
     * Sets the BodyPix model for machine learning-based background removal.
     * Loads the model based on the provided configuration or uses a default configuration.
     *
     * @param {IGreenScreenConfig} config - The configuration for the BodyPix model.
     * @returns {Promise<void>} A promise that resolves when the model is loaded and ready.
     * @memberof GreenScreenStream
     */
  
    public async setBodyPixModel(config: IGreenScreenConfig): Promise<void> {
        const model = await this.loadBodyPixModel(config);

        this.bodyPix = model;
        this.modelLoaded = true;
    }

    /**
     * Get the most dominant color in the imageData provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns {[number, number, number]} The dominant color as an RGB array.
     * @memberof GreenScreenStream
     */
  
    public dominant(imageData: ImageData, pixelCount: number): [number, number, number] {
        const p = this.pallette(imageData, pixelCount);
        const d = p[0];
        return d;
    };

    /**
     * Get a palette of the most common colors in the imageData provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns {[number, number, number][] | null} An array of RGB color arrays representing the palette.
     * @memberof GreenScreenStream
     */
  
    public pallette(imageData: ImageData, pixelCount: number): [number, number, number][] | null {
        const pixelArray = this.pixelArray(imageData.data, pixelCount, 10);
        const cmap = quantize(pixelArray, 8);
        const palette = cmap ? cmap.palette() : null;
        return palette;
    };

    /**
     * Sets the chroma key color used for green screen processing.
     * The chroma key color is specified as RGB values.
     *
     * @param {number} r - The red component of the chroma key color (0-255).
     * @param {number} g - The green component of the chroma key color (0-255).
     * @param {number} b - The blue component of the chroma key color (0-255).
     * @memberof GreenScreenStream
     */
    public setChromaKey(r: number, g: number, b: number): void {
        this.chromaKey.r = r;
        this.chromaKey.g = g;
        this.chromaKey.b = b;
    }


    /**
     * Sets the mask range for the green screen processing.
     * The mask range is specified as a vector with x and y components.
     *
     * @param {number} x - The x component of the mask range.
     * @param {number} y - The y component of the mask range.
     * @memberof GreenScreenStream
     */
 
    public setMaskRange(x: number, y: number): void {
        this.maskRange.x = x;
        this.maskRange.y = y;
    }

    /**
     * Flips the video stream horizontally.
     * Toggles the `flipHorizontal` property in the segment configuration.
     *
     * @memberof GreenScreenStream
     */
    public flipStreamHorizontal() {
        this.segmentConfig.flipHorizontal = !this.segmentConfig.flipHorizontal;
    }

    /**
     * Retrieves the color palette and dominant color from the current video stream.
     * This method captures the current frame from the video source, processes it,
     * and returns an object containing the color palette and dominant color.
     *
     * @returns {{ palette: [number, number, number][] | null, dominant: [number, number, number] }} An object containing the color palette and dominant color.
     * @memberof GreenScreenStream
     */
  
    public getColorsFromStream(): { palette: [number, number, number][] | null, dominant: [number, number, number] } {
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
    //#endregion
    //#region Private Methods

    /**
     * Sets up the WebGL renderer with the specified background URL.
     * Returns a promise that resolves when the renderer is successfully set up.
     *
     * @param {string} backgroundUrl - The URL of the background image or video to use.
     * @returns {Promise<boolean | Error>} A promise that resolves with true if setup is successful, or an error if it fails.
     */ 

    private setupRenderer(backgroundUrl: string): Promise<boolean | Error> {
        return new Promise<boolean | Error>(async (resolve, reject) => {
            this.ctx = this.canvas.getContext("webgl2");
            await this.setBackground(backgroundUrl).catch(err => {
                reject(err);
            });

            const textureSettings: ITextureSettings = this.getTextureSettings();

            await this.prepareRenderer(textureSettings).catch(err => {
                reject(new Error("Cannot setup renderer"))
            });
            resolve(true);
        });
    }

    /**
     * Returns the texture settings for the WebGL renderer.
     * These settings define how the background and webcam textures are handled.
     *
     * @returns {ITextureSettings} An object containing texture settings for background and webcam.
     */


    private getTextureSettings(): ITextureSettings {
        return {
            "background": {
                //unit: 33985,
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
                //unit: 33986,
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
     * Prepares the WebGL renderer with the specified texture settings.
     * This method initializes the DemolishedRenderer and adds assets and buffers for rendering.
     *
     * @param {ITextureSettings} textureSettings - The texture settings for the renderer.
     * @returns {Promise<boolean | Error>} A promise that resolves with true if preparation is successful, or an error if it fails.
     */
   
    private prepareRenderer(textureSettings: ITextureSettings): Promise<boolean | Error> {
        return new Promise<boolean | Error>(async (resolve, reject) => {
            try {
                this.demolished = new DemolishedRenderer(this.canvas as any, this.mainVert, this.mainFrag);
                this.demolished.addAssets(
                    textureSettings
                    , () => {
                        this.demolished.addBuffer(
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
     * Renders a virtual background using a green screen effect.
     * This method uses the DemolishedRenderer to apply the green screen effect
     * based on the current video frame and background.
     *
     * @param t - The current timestamp in milliseconds.
     */

    private renderVirtualBackgroundGreenScreen(t: number): void {
        if (!this.isRendering)
            return;
        if (this.startTime == null) 
            this.startTime = t;

        const seg = Math.floor((t - this.startTime) / (1000 / this.maxFps));
        if (seg > this.frame) {
            this.frame = seg;
            this.demolished.render(t / 1000)
        }
        this.rafId = requestAnimationFrame((ts) => this.renderVirtualBackgroundGreenScreen(ts));
    }

    /**
     * Renders the virtual background using BodyPix segmentation.
     * This method segments the person in the video and applies a mask to create a virtual background effect.
     *
     * @param {number} t - The current timestamp in milliseconds for rendering.
     * @returns {Promise<void>} A promise that resolves when the rendering is complete.
     */

    private async renderVirtualBackground(t: number): Promise<void> {
        if (!this.isRendering)
            return;
        if (this.startTime == null) 
            this.startTime = t;

        const seg = Math.floor((t - this.startTime) / (1000 / this.maxFps));

        if (seg > this.frame && this.modelLoaded) {
            const result = await this.bodyPix.segmentPerson(this.sourceVideo, this.segmentConfig);
            const maskedImage = BODY_PIX.toMask(result, this.foregroundColor, this.backgroundColor);

            BODY_PIX.drawMask(
                this.cameraSource as any,
                this.sourceVideo,
                maskedImage,
                this.opacity,
                this.maskBlurAmount,
                this.flipHorizontal
            );
            this.frame = seg;
            this.demolished.render(t / 1000);
        }
        this.rafId = requestAnimationFrame((ts) => this.renderVirtualBackground(ts));
    }

    /**
     * Sets the configuration for the green screen mask settings.
     * This method updates the properties of the class based on the provided configuration.
     *
     * @param {IMaskSettings} [config] - The configuration settings for the mask.
     */

    private setConfig(config?: IMaskSettings): void {
        const defaults = DEFAULT_MASK_SETTINGS;
        this.opacity = config?.opacity || defaults.opacity;
        this.flipHorizontal = config?.flipHorizontal || defaults.flipHorizontal;
        this.maskBlurAmount = config?.maskBlurAmount || defaults.maskBlurAmount;
        this.foregroundColor = config?.foregroundColor || defaults.foregroundColor;
        this.backgroundColor = config?.backgroundColor || defaults.backgroundColor;

        this.segmentConfig = {
            flipHorizontal: config?.segmentPerson.flipHorizontal || defaults.segmentPerson.flipHorizontal,
            internalResolution: config?.segmentPerson.internalResolution || defaults.segmentPerson.internalResolution,
            segmentationThreshold: config?.segmentPerson.segmentationThreshold || defaults.segmentPerson.segmentationThreshold,
            maxDetections: config?.segmentPerson.maxDetections || defaults.segmentPerson.maxDetections,
            quantBytes: config?.segmentPerson.quantBytes || defaults.segmentPerson.quantBytes
        };
    }

    /**
     * Sets the resolution of the canvas based on the provided resolution parameter.
     * If the resolution is a Vector2 or a valid object literal, it sets the width and height accordingly.
     * Otherwise, it converts the VideoResolution enum to a Vector2 and sets the canvas dimensions.
     *
     * @param {VideoResolution | Vector2} resolution - The desired video resolution or a Vector2 object.
     */

    private setCanvasResolution(resolution: VideoResolution | Vector2) {
        //Check if resolution is a vector2 (or a valid vector2 object literal)
        if(resolution instanceof Vector2 || Vector2.isValidVector2(resolution)) 
            this.resolution = resolution as Vector2;
        else
            this.resolution = resolutionFromEnum(resolution);

        this.canvas.width = this.resolution.x;
        this.canvas.height = this.resolution.y;
    }

    /**
     * Loads the BodyPix model based on the provided configuration or default settings.
     * If a BodyPix configuration is provided, it uses that; otherwise, it retrieves the model based on the green screen mode.
     *
     * @param {IGreenScreenConfig} config - The configuration for the green screen, which may include BodyPix settings.
     * @returns {Promise<BodyPix>} A promise that resolves with the loaded BodyPix model.
     */ 
    
    private async loadBodyPixModel(config: IGreenScreenConfig) {
        let bodyPixMode: ModelConfig;

        if (config?.bodyPixConfig)
            bodyPixMode = config?.bodyPixConfig as ModelConfig;
        else
            bodyPixMode = getBodyPixMode(config?.bodyPixMode) as ModelConfig;

        if (this.modelLoaded) {
            this.bodyPix.dispose();
            this.modelLoaded = false;
        }
        return load(bodyPixMode);
    }

    /**
     * Extracts pixel data from the provided pixel array, filtering out pixels based on quality and alpha value.
     * Returns an array of RGB color values for the pixels that meet the criteria.
     *
     * @param {any} pixels - The pixel data array (typically from an ImageData object).
     * @param {number} pixelCount - The total number of pixels to process.
     * @param {number} quality - The quality factor to reduce the number of pixels processed.
     * @returns {Array<number>} An array of RGB color values for the filtered pixels.
     */ 
    private pixelArray(pixels: any, pixelCount: number, quality: number): Array<number> {
        const pixelArray = [];
        for (let i = 0, offset: number, r: number, g: number, b: number, a: number; i < pixelCount; i = i + quality) {
            offset = i * 4;
            r = pixels[offset + 0];
            g = pixels[offset + 1];
            b = pixels[offset + 2];
            a = pixels[offset + 3];
            if (typeof a === 'undefined' || a >= 125)
                if (!(r > 250 && g > 250 && b > 250))
                    pixelArray.push([r, g, b]);
        }
        return pixelArray;
    }

    private getIsImage(url: string): boolean {
        return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
    }
    //#endregion
}