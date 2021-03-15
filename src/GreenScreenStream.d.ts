import { DR } from 'demolishedrenderer';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
export declare type MaskSettings = {
    opacity: number;
    flipHorizontal: boolean;
    maskBlurAmount: number;
    foregroundColor: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    backgroundColor: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    segmentPerson: {
        flipHorizontal: boolean;
        internalResolution: string;
        segmentationThreshold: number;
        maxDetections: number;
    };
};
export declare class GreenScreenStream {
    useML: boolean;
    canvas: HTMLCanvasElement;
    ctx: WebGL2RenderingContext;
    renderer: DR;
    mediaStream: MediaStream;
    model: any;
    onReady: () => void;
    private backgroundSource;
    private sourceVideo;
    private cameraSource;
    private chromaKey;
    private maskRange;
    mainFrag: string;
    mainVert: string;
    bufferVert: string;
    bufferFrag: string;
    /**
     *Creates an instance of GreenScreenStream.
     * @param {string} backgroundUrl backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optional.
     * @memberof GreenScreenStream
     */
    constructor(useML: boolean, backgroundUrl?: string, canvas?: HTMLCanvasElement, width?: number, height?: number);
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
     * Get a masked image/canvas of -n persons
     *
     * @param {HTMLCanvasElement} target
     * @param {*} [config]
     * @memberof GreenScreenStream
     */
    getMask(target: HTMLCanvasElement, config?: MaskSettings | any): void;
    private maskStream;
    /**
     * Start renderer
     *
     * @param {number} [fps]
     * @param {*} [config]
     * @memberof GreenScreenStream
     */
    render(fps?: number, config?: MaskSettings | any): void;
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
    static getInstance(useAI: boolean, backgroudImage?: string, canvas?: HTMLCanvasElement, width?: number, height?: number): GreenScreenStream;
    private pixelArray;
    /**
     *  Get the dominant color from the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    dominant(imageData: ImageData, pixelCount: number): any;
    /**
     * Get a pallette (10) of the most used colors in the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    pallette(imageData: ImageData, pixelCount: number): any;
}
