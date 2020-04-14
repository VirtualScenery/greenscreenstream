"use strict";
exports.__esModule = true;
var demolishedrenderer_1 = require("demolishedrenderer");
var quantize_1 = require("quantize");
var bodyPix = require('@tensorflow-models/body-pix');
var GreenScreenStream = /** @class */ (function () {
    /**
     *Creates an instance of GreenScreenStream.
     * @param {string} backgroudImage backgound image that replaces the "green"
     * @param {HTMLCanvasElement} [canvas] HTML5 Canvas element to render to, optional
     * @param {number} [width] width of the HTML5 Canvas element, optional.
     * @param {number} [height] height of the HTML5 Canvas element, optional.
     * @memberof GreenScreenStream
     */
    function GreenScreenStream(useML, backgroudImage, canvas, width, height) {
        var _this = this;
        this.useML = useML;
        this.chromaKey = { r: 0.05, g: 0.63, b: 0.14 };
        this.maskRange = { x: 0.005, y: 0.26 };
        this.mainFrag = "uniform vec2 resolution;\n    uniform sampler2D A;\n    out vec4 fragColor;\n    void main(){\n        vec2 uv = gl_FragCoord.xy/resolution.xy;        \n        fragColor = texture(A, uv);\n    }";
        this.mainVert = "layout(location = 0) in vec2 pos; \n    out vec4 fragColor;                \n    void main() { \n        gl_Position = vec4(pos.xy,0.0,1.0);\n    }    \n    ";
        this.bufferFrag = "uniform float time;\n    uniform vec2 resolution;   \n    uniform sampler2D webcam;\n    uniform sampler2D background;\n    uniform vec4 chromaKey; \n    uniform vec2 maskRange;\n    out vec4 fragColor;\n\n    mat4 RGBtoYUV = mat4(0.257,  0.439, -0.148, 0.0,\n        0.504, -0.368, -0.291, 0.0,\n        0.098, -0.071,  0.439, 0.0,\n        0.0625, 0.500,  0.500, 1.0 );\n\n\n\nfloat colorclose(vec3 yuv, vec3 keyYuv, vec2 tol)\n{\nfloat tmp = sqrt(pow(keyYuv.g - yuv.g, 2.0) + pow(keyYuv.b - yuv.b, 2.0));\nif (tmp < tol.x)\nreturn 0.0;\nelse if (tmp < tol.y)\nreturn (tmp - tol.x)/(tol.y - tol.x);\nelse\nreturn 1.0;\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{ \nvec2 fragPos =  1. - fragCoord.xy / resolution.xy;\nvec4 fg = texture(webcam, fragPos);\nvec4 bg = texture(background, fragPos);\n\nvec4 keyYUV =  RGBtoYUV * chromaKey;\nvec4 yuv = RGBtoYUV * fg;\n\nfloat mask = 1.0 - colorclose(yuv.rgb, keyYUV.rgb, maskRange);\nfragColor = max(fg - mask * chromaKey, 0.0) + bg * mask;\n}    \n\nvoid main(){    \n    mainImage(fragColor,gl_FragCoord.xy);      \n}";
        if (canvas) {
            this.canvas = canvas;
        }
        else {
            this.canvas = document.createElement("canvas");
            this.canvas.width = width || 800;
            this.canvas.height = height || 450;
        }
        this.ctx = this.canvas.getContext("webgl2");
        this.mediaStream = new MediaStream();
        if (backgroudImage) {
            this.renderer = new demolishedrenderer_1.DR(this.canvas, this.mainVert, this.mainFrag);
            this.renderer.aA({
                "background": {
                    num: 33985,
                    src: backgroudImage
                },
                "webcam": {
                    num: 33984,
                    fn: function (gl, texture) {
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        gl.texImage2D(3553, 0, 6408, 6408, 5121, _this.cameraSource);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }
                }
            }, function () {
                _this.renderer.aB("A", _this.mainVert, _this.bufferFrag, ["webcam", "background"], {
                    "chromaKey": function (location, gl, p, timestamp) {
                        gl.uniform4f(location, _this.chromaKey.r, _this.chromaKey.g, _this.chromaKey.b, 1.);
                    },
                    "maskRange": function (location, gl, p, timestamp) {
                        gl.uniform2f(location, _this.maskRange.x, _this.maskRange.y);
                    }
                });
            });
        }
    }
    /**
     * Set the color to be removed
     * i.e (0.05,0.63,0.14)
     * @param {number} r  0.0 - 1.0
     * @param {number} g 0.0 - 1.0
     * @param {number} b 0.0 - 1.0
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.setChromaKey = function (r, g, b) {
        this.chromaKey.r = r;
        this.chromaKey.g = g;
        this.chromaKey.b = b;
    };
    /**
     * Range is used to decide the amount of color to be used from either foreground or background.
     * Playing with this variable will decide how much the foreground and background blend together.
     * @param {number} x
     * @param {number} y
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.setMaskRange = function (x, y) {
        this.maskRange.x = x;
        this.maskRange.y = y;
    };
    /**
     * Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack
     *
     * @returns {{ palette: any, dominant: any }}
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.getColorsFromStream = function () {
        var glCanvas = this.canvas;
        var tempCanvas = document.createElement("canvas");
        tempCanvas.width = glCanvas.width;
        tempCanvas.height = glCanvas.height;
        var ctx = tempCanvas.getContext("2d");
        ctx.drawImage(this.sourceVideo, 0, 0);
        var imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        var pixels = this.canvas.width * this.canvas.height;
        return {
            palette: this.pallette(imageData, pixels),
            dominant: this.dominant(imageData, pixels)
        };
    };
    GreenScreenStream.prototype.maskStream = function (config, target, cb) {
        var _this = this;
        var opacity = config.opacity || 1.;
        var flipHorizontal = config.flipHorizontal || true;
        var maskBlurAmount = config.maskBlurAmount || 9;
        var foregroundColor = config.foregroundColor || { r: 255, g: 255, b: 255, a: 0 };
        var backgroundColor = config.backgroundColor || { r: 0, g: 177, b: 64, a: 255 };
        var canvas = target || document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 450;
        var _config = config.segmentPerson || {
            flipHorizontal: true,
            internalResolution: 'medium',
            segmentationThreshold: 0.55,
            maxDetections: 4
        };
        if (cb)
            cb(canvas);
        var update = function () {
            _this.model.segmentPerson(_this.sourceVideo, _config).then(function (segmentation) {
                var maskedImage = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
                bodyPix.drawMask(canvas, _this.sourceVideo, maskedImage, opacity, maskBlurAmount, flipHorizontal);
                requestAnimationFrame(update);
            });
        };
        update();
    };
    /**
     * Start renderer
     *
     * @param {number} [fps]
     * @param {*} [config]
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.render = function (fps, config) {
        var _this = this;
        if (!this.renderer)
            throw "Now renderer created.Background image must be provided.";
        if (this.useML) {
            bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            }).then(function (model) {
                _this.model = model;
                _this.maskStream(config || {}, null, function (canvas) {
                    _this.cameraSource = canvas;
                    _this.renderer.run(0, fps || 25);
                });
            });
        }
        else
            this.cameraSource = this.sourceVideo;
        this.renderer.run(0, fps || 25);
    };
    /**
     * Get a masked image/canvas of -n persons
     *
     * @param {HTMLCanvasElement} target
     * @param {*} [config]
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.getMask = function (target, config) {
        var _this = this;
        bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        }).then(function (model) {
            _this.model = model;
            _this.maskStream(config, target, function (canvas) {
            });
        });
    };
    /**
     * Add a MediaStreamTrack track (i.e webcam )
     *
     * @param {MediaStreamTrack} track
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.addVideoTrack = function (track) {
        this.mediaStream.addTrack(track);
        this.sourceVideo = document.createElement("video");
        this.sourceVideo.width = 800, this.sourceVideo.height = 450;
        this.sourceVideo.autoplay = true;
        this.sourceVideo.srcObject = this.mediaStream;
        this.sourceVideo.play();
        this.cameraSource = this.sourceVideo;
    };
    /**
     * Capture the rendered result to a MediaStream
     *
     * @param {number} [fps]
     * @returns {MediaStream}
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.captureStream = function (fps) {
        return this.canvas["captureStream"](fps || 25);
    };
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
    GreenScreenStream.getInstance = function (useAI, backgroudImage, canvas, width, height) {
        return new GreenScreenStream(useAI, backgroudImage, canvas, width, height);
    };
    GreenScreenStream.prototype.pixelArray = function (pixels, pixelCount, quality) {
        var pixelArray = [];
        for (var i = 0, offset = void 0, r = void 0, g = void 0, b = void 0, a = void 0; i < pixelCount; i = i + quality) {
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
    };
    /**
     *  Get the dominant color from the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.dominant = function (imageData, pixelCount) {
        var p = this.pallette(imageData, pixelCount);
        var d = p[0];
        return d;
    };
    ;
    /**
     * Get a pallette (10) of the most used colors in the MediaStreamTrack provided
     *
     * @param {ImageData} imageData
     * @param {number} pixelCount
     * @returns
     * @memberof GreenScreenStream
     */
    GreenScreenStream.prototype.pallette = function (imageData, pixelCount) {
        var pixelArray = this.pixelArray(imageData.data, pixelCount, 10);
        var cmap = quantize_1["default"](pixelArray, 8);
        var palette = cmap ? cmap.palette() : null;
        return palette;
    };
    ;
    return GreenScreenStream;
}());
exports.GreenScreenStream = GreenScreenStream;
