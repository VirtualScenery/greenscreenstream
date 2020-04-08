/// <reference types="webgl2" />
import { DR } from 'demolishedrenderer';
export declare class GreenScreenStream {
    canvas: HTMLCanvasElement;
    ctx: WebGL2RenderingContext;
    renderer: DR;
    mediaStream: MediaStream;
    video: HTMLVideoElement;
    private mainFrag;
    private mainVert;
    private bufferFrag;
    /**
     *Creates an instance of GreenScreenStream.
     * @param {string} backgroudImage backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optional.
     * @memberof GreenScreenStream
     */
    constructor(backgroudImage: string, canvas?: HTMLCanvasElement, width?: number, height?: number);
    /**
     * Start render the new media stream
     *
     * @param {number} [fps] Frames per second
     * @memberof GreenScreenStream
     */
    render(fps?: number): void;
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
     * @param {number} [fps] Frames per second
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
    static getInstance(backgroudImage: string, canvas?: HTMLCanvasElement, width?: number, height?: number): GreenScreenStream;
}
