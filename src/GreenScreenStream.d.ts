import { DR } from 'demolishedrenderer';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
export declare type MaskSettings = {
    opacity?: number;
    flipHorizontal?: boolean;
    maskBlurAmount?: number;
    foregroundColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    backgroundColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    segmentPerson?: {
        flipHorizontal?: boolean;
        internalResolution?: string;
        segmentationThreshold?: number;
        maxDetections?: number;
    };
};
export declare enum GreenScreenMethod {
    Mask = 0,
    VirtualBackground = 1,
    VirtualBackgroundUsingGreenScreen = 2
}
export declare class GreenScreenStream {
    greenScreenMethod: GreenScreenMethod;
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
    constructor(greenScreenMethod: GreenScreenMethod, canvas?: HTMLCanvasElement, width?: number, height?: number);
    /**
     * set up the rendering, texture etc.
     *
     * @private
     * @param {string} [backgroundUrl]
     * @return {*}  {Promise<any>}
     * @memberof GreenScreenStream
     */
    private setupRenderer;
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
     * @memberof GreenScreenStream
     */
    start(): void;
    /**
     * Stop renderer
     *
     * @param {boolean} [stopMediaStreams]
     * @memberof GreenScreenStream
     */
    stop(stopMediaStreams?: boolean): void;
    /**
     * Initalize
     *
     * @param {string} [backgroundUrl]
     * @param {MaskSettings} [config]
     * @return {*}  {Promise<boolean>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl?: string, config?: MaskSettings): Promise<boolean>;
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    addVideoTrack(track: MediaStreamTrack): void;
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
