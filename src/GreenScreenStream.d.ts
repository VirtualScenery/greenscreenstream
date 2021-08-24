import { DR } from 'demolishedrenderer';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { GreenScreenConfig } from './models/green-screen-config.interface';
import { GreenScreenMethod } from './models/green-screen-method.enum';
export declare class GreenScreenStream {
    greenScreenMethod: GreenScreenMethod;
    canvasEl?: HTMLCanvasElement;
    isRendering: boolean;
    frame: number;
    rafId: number;
    startTime: number;
    opacity: any;
    flipHorizontal: any;
    maskBlurAmount: any;
    foregroundColor: any;
    backgroundColor: any;
    ctx: WebGL2RenderingContext;
    demolished: DR;
    mediaStream: MediaStream;
    model: any;
    private segmentConfig;
    private backgroundSource;
    private sourceVideo;
    private cameraSource;
    private chromaKey;
    private maskRange;
    private useML;
    mainFrag: string;
    mainVert: string;
    bufferVert: string;
    bufferFrag: string;
    maxFps: number;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    offscreen: OffscreenCanvas;
    currentRenderTime: number;
    constructor(greenScreenMethod: GreenScreenMethod, canvasEl?: HTMLCanvasElement, width?: number, height?: number);
    /**
     * Set the background
     *
     * @param {string} src
     * @return {*}  {(Promise<HTMLImageElement | HTMLVideoElement | Error>)}
     * @memberof GreenScreenStream
     */
    setBackground(src: string): Promise<HTMLImageElement | HTMLVideoElement | Error>;
    /**
     * Set up the rendering, texturesx etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<boolean | Error>}
     * @memberof GreenScreenStream
     */
    private setupRenderer;
    /**
     * Get the necessary texture settings
     */
    private getTextureSettings;
    /**
     * Instantiates & prepares the demolishedRenderer
     * @param textureSettings
     */
    private prepareRenderer;
    /**
     * Set the color to be removed
     * i.e (0.05,0.63,0.14)
     * @param {number} r  0.0 - 1.0
     * @param {number} g 0.0 - 1.0
     * @param {number} b 0.0 - 1.0
     * @memberof GreenScreenStream
     */
    setChromaKey(r: number, g: number, b: number): void;
    /**
     * Range is used to decide the amount of color to be used from either foreground or background.
     * Playing with this variable will decide how much the foreground and background blend together.
     * @param {number} x
     * @param {number} y
     * @memberof GreenScreenStream
     */
    setMaskRange(x: number, y: number): void;
    /**
     * Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack
     *
     * @returns {{ palette: any, dominant: any }}
     * @memberof GreenScreenStream
     */
    getColorsFromStream(): {
        palette: any;
        dominant: any;
    };
    /**
     * Start render
     *
     * @param {number} [maxFps] maximum frame rate, defaults to 60fps
     * @memberof GreenScreenStream
     */
    start(maxFps?: number): void;
    /**
    * Renders a virtual background using a greenscreen
    * @param t
    */
    private renderVirtualBackgroundGreenScreen;
    /**
     * Renders a virtual background using ML
     * @param t
     */
    private renderVirtualBackground;
    /**
     * Renders using a mask
     * @param t
     * @param ctx
     */
    private renderMask;
    /**
     * Stop renderer
     * @param {boolean} [stopMediaStreams]
     * @memberof GreenScreenStream
     */
    stop(stopMediaStreams?: boolean): void;
    /**
     * Initalize
     * @param {string} [backgroundUrl]
     * @param {MaskSettings} [config]
     * @return {*}  {Promise<GreenScreenStream>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl?: string, config?: GreenScreenConfig): Promise<GreenScreenStream>;
    /**
     * Applies the passed config or sets up a standard config when no config is provided on initialization
     */
    private setConfig;
    setBodyPixModel(config: GreenScreenConfig): Promise<void>;
    /**
     * Sets up the bodypix model either via custom config or a preset.
     * If neither is provided, a default config is used.
     * @param config
     */
    private loadBodyPixModel;
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track: MediaStreamTrack): Promise<void>;
    /**
     * Capture the rendered result to a MediaStream
     *
     * @param {number} [fps]
     * @returns {MediaStream}
     * @memberof GreenScreenStream
     */
    captureStream(fps?: number): MediaStream;
    private pixelArray;
    /**
     *  Get the dominant color from the imageData provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    dominant(imageData: ImageData, pixelCount: number): any;
    /**
     * Get a pallette (10) of the most used colors in the imageData provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    pallette(imageData: ImageData, pixelCount: number): any;
}
