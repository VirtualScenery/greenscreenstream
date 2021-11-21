"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenScreenStream = void 0;
const demolishedrenderer_1 = require("demolishedrenderer");
const quantize_1 = __importDefault(require("quantize"));
const bodyPix = require('@tensorflow-models/body-pix');
require("@tensorflow/tfjs-backend-webgl");
require("@tensorflow/tfjs-backend-cpu");
const glsl_constants_1 = require("./models/glsl-constants");
const green_screen_method_enum_1 = require("./models/green-screen-method.enum");
const get_bodypix_mode_util_1 = require("./utils/get-bodypix-mode.util");
const async_call_util_1 = require("./utils/async-call.util");
class GreenScreenStream {
    constructor(greenScreenMethod, canvasEl, width = 640, height = 360) {
        this.greenScreenMethod = greenScreenMethod;
        this.canvasEl = canvasEl;
        this.frame = -1;
        this.startTime = null;
        this.chromaKey = { r: 0.0, g: 0.6941176470588235, b: 0.25098039215686274 }; // { r: 0, g: 177, b: 64
        this.maskRange = { x: 0.0025, y: 0.26 };
        this.mainFrag = glsl_constants_1.MAIN_FRAG;
        this.mainVert = glsl_constants_1.MAIN_VERT;
        this.bufferVert = glsl_constants_1.BUFFER_VERT;
        this.bufferFrag = glsl_constants_1.BUFFER_FRAG;
        this.mediaStream = new MediaStream();
        if (canvasEl) {
            this.canvas = canvasEl;
        }
        else {
            this.canvas = document.createElement("canvas");
        }
        this.canvas.width = width;
        this.canvas.height = height;
        if (greenScreenMethod !== green_screen_method_enum_1.GreenScreenMethod.VirtualBackgroundUsingGreenScreen)
            this.useML = true;
    }
    /**
     * Set the background
     *
     * @param {string} src
     * @return {*}  {(Promise<HTMLImageElement | HTMLVideoElement | Error>)}
     * @memberof GreenScreenStream
     */
    setBackground(src) {
        return new Promise((resolve, reject) => {
            const isImage = src.match(/\.(jpeg|jpg|png)$/) !== null;
            if (isImage) {
                const bg = new Image();
                bg.onerror = () => {
                    reject(new Error(`Unable to background image from ${src}`));
                };
                bg.onload = () => {
                    this.backgroundSource = bg;
                    resolve(bg);
                };
                bg.src = src;
            }
            else {
                const bg = document.createElement("video");
                bg.autoplay = true;
                bg.loop = true;
                bg.onerror = () => {
                    reject(new Error(`Unable to load background video from ${src}`));
                };
                bg.onloadeddata = () => {
                    this.backgroundSource = bg;
                    resolve(bg);
                };
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
    setupRenderer(backgroundUrl) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.ctx = this.canvas.getContext("webgl2");
            yield this.setBackground(backgroundUrl).catch(err => {
                reject(err);
            });
            const textureSettings = this.getTextureSettings();
            yield this.prepareRenderer(textureSettings).catch(err => {
                reject(new Error("Cannot setup renderer"));
            });
            resolve(true);
        }));
    }
    /**
     * Get the necessary texture settings
     */
    getTextureSettings() {
        return {
            "background": {
                //unit: 33985,
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
                //unit: 33986,
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
    }
    /**
     * Instantiates & prepares the demolishedRenderer
     * @param textureSettings
     */
    prepareRenderer(textureSettings) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (err) {
                reject(new Error(err));
            }
        }));
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
     * @param {number} [maxFps] maximum frame rate, defaults to 25fps
     * @memberof GreenScreenStream
     */
    start(maxFps) {
        this.maxFps = maxFps || 25;
        this.isRendering = true;
        const canvas = document.createElement("canvas"); //need to declare it here because of scope
        switch (this.greenScreenMethod) {
            case green_screen_method_enum_1.GreenScreenMethod.VirtualBackgroundUsingGreenScreen:
                this.renderVirtualBackgroundGreenScreen(0);
                break;
            case green_screen_method_enum_1.GreenScreenMethod.VirtualBackground:
                this.cameraSource = canvas;
                this.renderVirtualBackground(0);
                break;
            case green_screen_method_enum_1.GreenScreenMethod.Mask:
                const ctx = canvas.getContext("2d");
                this.renderMask(0, ctx);
                break;
        }
    }
    /**
    * Renders a virtual background using a greenscreen
    * @param t
    */
    renderVirtualBackgroundGreenScreen(t) {
        if (!this.isRendering)
            return;
        if (this.startTime == null)
            this.startTime = t;
        let seg = Math.floor((t - this.startTime) / (1000 / this.maxFps));
        if (seg > this.frame) {
            this.frame = seg;
            this.demolished.R(t / 1000);
        }
        this.rafId = requestAnimationFrame((ts) => this.renderVirtualBackgroundGreenScreen(ts));
    }
    /**
     * Renders a virtual background using ML
     * @param t
     */
    renderVirtualBackground(t) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRendering)
                return;
            if (this.startTime == null)
                this.startTime = t;
            let seg = Math.floor((t - this.startTime) / (1000 / this.maxFps));
            if (seg > this.frame) {
                const { error, result } = yield async_call_util_1.asyncCall(this.model.segmentPerson(this.sourceVideo, this.segmentConfig));
                if (error)
                    return console.error(error);
                //    console.time("bodyPix toMask")
                const maskedImage = bodyPix.toMask(result, this.foregroundColor, this.backgroundColor);
                bodyPix.drawMask(this.cameraSource, this.sourceVideo, maskedImage, this.opacity, this.maskBlurAmount, this.flipHorizontal);
                this.frame = seg;
                this.demolished.R(t / 1000);
            }
            this.rafId = requestAnimationFrame((ts) => this.renderVirtualBackground(ts));
        });
    }
    /**
     * Renders using a mask
     * @param t
     * @param ctx
     */
    renderMask(t, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRendering)
                return;
            if (this.startTime == null)
                this.startTime = t;
            let seg = Math.floor((t - this.startTime) / (1000 / this.maxFps));
            if (seg > this.frame) {
                const { error, result } = yield async_call_util_1.asyncCall(this.model.segmentPerson(this.sourceVideo, this.segmentConfig));
                if (error)
                    return console.error(error);
                const maskedImage = bodyPix.toMask(result, this.foregroundColor, this.backgroundColor);
                ctx.putImageData(maskedImage, 0, 0);
                this.demolished.R(t / 1000);
            }
            this.rafId = requestAnimationFrame((ts) => this.renderMask(ts, ctx));
        });
    }
    /**
     * Stop renderer
     * @param {boolean} [stopMediaStreams]
     * @memberof GreenScreenStream
     */
    stop(stopMediaStreams) {
        this.isRendering = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = -1;
        if (stopMediaStreams) {
            this.mediaStream.getVideoTracks().forEach(track => {
                track.stop();
            });
            this.ctx = null;
        }
        this.startTime = null;
        this.frame = -1;
    }
    /**
     * Initalize
     * @param {string} [backgroundUrl]
     * @param {MaskSettings} [config]
     * @return {*}  {Promise<GreenScreenStream>}
     * @memberof GreenScreenStream
     */
    initialize(backgroundUrl, config) {
        this.setConfig(config === null || config === void 0 ? void 0 : config.maskSettings);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = yield async_call_util_1.asyncCall(this.setupRenderer(backgroundUrl));
            if (result.error)
                reject(result.error);
            if (!this.demolished)
                reject(`No renderer created. Background source must be provided.`);
            if (!this.useML)
                resolve(this);
            const model = yield async_call_util_1.asyncCall(this.loadBodyPixModel(config));
            if (model.error)
                reject(model.error);
            console.log(model.result);
            this.model = model.result;
            resolve(this);
        }));
    }
    /**
     * Applies the passed config or sets up a standard config when no config is provided on initialization
     */
    setConfig(config) {
        this.opacity = (config === null || config === void 0 ? void 0 : config.opacity) || 1.0;
        this.flipHorizontal = (config === null || config === void 0 ? void 0 : config.flipHorizontal) || true;
        this.maskBlurAmount = (config === null || config === void 0 ? void 0 : config.maskBlurAmount) || 3;
        this.foregroundColor = (config === null || config === void 0 ? void 0 : config.foregroundColor) || { r: 255, g: 255, b: 255, a: 0 };
        this.backgroundColor = (config === null || config === void 0 ? void 0 : config.backgroundColor) || { r: 0, g: 177, b: 64, a: 255 };
        this.segmentConfig = {
            flipHorizontal: (config === null || config === void 0 ? void 0 : config.segmentPerson.flipHorizontal) || true,
            internalResolution: (config === null || config === void 0 ? void 0 : config.segmentPerson.internalResolution) || 'medium',
            segmentationThreshold: (config === null || config === void 0 ? void 0 : config.segmentPerson.segmentationThreshold) || 0.7,
            maxDetections: (config === null || config === void 0 ? void 0 : config.segmentPerson.maxDetections) || 1,
            quantBytes: (config === null || config === void 0 ? void 0 : config.segmentPerson.quantBytes) || 2
        };
        console.log(this.segmentConfig);
    }
    /**
     *
     *
     * @param {IGreenScreenConfig} config
     * @memberof GreenScreenStream
     */
    setBodyPixModel(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield async_call_util_1.asyncCall(this.loadBodyPixModel(config));
            if (model.error)
                throw model.error;
            this.model = model.result;
        });
    }
    /**
     * Sets up the bodypix model either via custom config or a preset.
     * If neither is provided, a default config is used.
     * @param config
     */
    loadBodyPixModel(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let bodyPixMode;
            console.log(config);
            if (config === null || config === void 0 ? void 0 : config.bodyPixConfig) {
                bodyPixMode = config === null || config === void 0 ? void 0 : config.bodyPixConfig;
                console.log("No config found. Fallining back to mode");
            }
            else {
                bodyPixMode = get_bodypix_mode_util_1.getBodyPixMode(config === null || config === void 0 ? void 0 : config.bodyPixMode);
            }
            return bodyPix.load(bodyPixMode);
        });
    }
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @return {*}  {Promise<void|any>}
     * @memberof GreenScreenStream
     */
    addVideoTrack(track) {
        return new Promise((resolve, reject) => {
            try {
                this.mediaStream.addTrack(track);
                this.sourceVideo = document.createElement("video");
                this.sourceVideo.width = this.canvas.width, this.sourceVideo.height = this.canvas.height;
                this.sourceVideo.autoplay = true;
                this.sourceVideo.srcObject = this.mediaStream;
                this.sourceVideo.onloadeddata = () => {
                    this.sourceVideo.play();
                    this.cameraSource = this.sourceVideo;
                    resolve();
                };
                this.sourceVideo.onerror = (err) => {
                    reject(err);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Capture the rendered result to a MediaStream
     *
     * @param {number} [fps]
     * @returns {MediaStream}
     * @memberof GreenScreenStream
     */
    captureStream(fps) {
        try {
            return this.canvas["captureStream"](fps || 25);
        }
        catch (error) {
            throw error;
        }
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
//# sourceMappingURL=GreenScreenStream.js.map