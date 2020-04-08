/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./example/App.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./example/App.js":
/*!************************!*\
  !*** ./example/App.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst GreenScreenStream_1 = __webpack_require__(/*! ../src/GreenScreenStream */ \"./src/GreenScreenStream.js\");\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    let instance = GreenScreenStream_1.GreenScreenStream.getInstance(\"assets/palmtrees.jpg\");\n    navigator.getUserMedia({ video: true, audio: false }, (m) => {\n        instance.addVideoTrack(m.getTracks()[0]);\n        instance.render();\n        document.querySelector(\"video\").srcObject = instance.captureStream(25);\n    }, (e) => console.error(e));\n    // expose to  window.\n    window[\"greatStream\"] = instance;\n});\n\n\n//# sourceURL=webpack:///./example/App.js?");

/***/ }),

/***/ "./node_modules/demolishedrenderer/index.js":
/*!**************************************************!*\
  !*** ./node_modules/demolishedrenderer/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\n__export(__webpack_require__(/*! ./src/DR */ \"./node_modules/demolishedrenderer/src/DR.js\"));\n\n\n//# sourceURL=webpack:///./node_modules/demolishedrenderer/index.js?");

/***/ }),

/***/ "./node_modules/demolishedrenderer/src/DR.js":
/*!***************************************************!*\
  !*** ./node_modules/demolishedrenderer/src/DR.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar DR = (function () {\n    function DR(canvas, v, f, cU) {\n        if (cU === void 0) { cU = {}; }\n        this.canvas = canvas;\n        this.cU = cU;\n        this.header = \"#version 300 es\\n#ifdef GL_ES\\nprecision highp float;\\nprecision highp int;\\nprecision mediump sampler3D;\\n#endif\\n\";\n        this.targets = new Map();\n        this.programs = new Map();\n        this.textureCache = new Map();\n        this.gl = canvas.getContext(\"webgl2\", { preserveDrawingBuffer: true });\n        var gl = this.gl;\n        var c = 0, d;\n        for (var i in gl)\n            \"function\" == typeof gl[i] && (d = (c++ & 255).toString(16), d = d.match(/^[0-9].*$/) ? \"x\" + d : d, gl[d] = gl[i]);\n        gl.viewport(0, 0, canvas.width, canvas.height);\n        this.buffer = gl.createBuffer();\n        this.surfaceBuffer = gl.createBuffer();\n        this.mainProgram = gl.createProgram();\n        this.cS(this.mainProgram, 35633, this.header + v);\n        this.cS(this.mainProgram, 35632, this.header + f);\n        gl.linkProgram(this.mainProgram);\n        this.gl.validateProgram(this.mainProgram);\n        if (!gl.getProgramParameter(this.mainProgram, gl.LINK_STATUS)) {\n            var info = gl.getProgramInfoLog(this.mainProgram);\n            throw 'Could not compile WebGL program. \\n\\n' + info;\n        }\n        gl.useProgram(this.mainProgram);\n        this.screenVertexPosition = gl.getAttribLocation(this.mainProgram, \"pos\");\n        gl.enableVertexAttribArray(this.screenVertexPosition);\n        gl.bindBuffer(34962, this.buffer);\n        gl.bufferData(34962, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), 35044);\n    }\n    DR.prototype.cS = function (program, type, source) {\n        var gl = this.gl;\n        var shader = gl.createShader(type);\n        gl.shaderSource(shader, source);\n        gl.compileShader(shader);\n        gl.attachShader(program, shader);\n        if (!this.gl.getShaderParameter(shader, 35713)) {\n            this.gl.getShaderInfoLog(shader).trim().split(\"\\n\").forEach(function (l) {\n                return console.error(\"[shader] \" + l);\n            });\n            throw new Error(\"Error while compiling vertex/fragment\" + source);\n        }\n        ;\n    };\n    DR.prototype.aP = function (name) {\n        var p = this.gl.createProgram();\n        this.programs.set(name, p);\n        return p;\n    };\n    DR.prototype.t = function (data, d) {\n        var gl = this.gl;\n        var texture = gl.createTexture();\n        gl.activeTexture(d);\n        gl.bindTexture(3553, texture);\n        if (data instanceof Image) {\n            var ispowerof2 = data.width == data.height;\n            gl.texImage2D(3553, 0, 6408, 6408, 5121, data);\n        }\n        else {\n            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\n        }\n        gl.generateMipmap(3553);\n        return texture;\n    };\n    DR.prototype.aA = function (assets, cb) {\n        var _this = this;\n        var cache = function (k, n, v, f) {\n            _this.textureCache.set(k, { num: n, src: v, fn: f });\n        };\n        var p = function (key, texture) {\n            return new Promise(function (resolve, reject) {\n                if (!texture.src) {\n                    var unit = texture.num;\n                    cache(key, unit, _this.t(new Uint8Array(1024), unit), texture.fn);\n                    resolve(key);\n                }\n                else {\n                    var m_1 = new Image();\n                    m_1.onload = function (e) {\n                        var unit = texture.num;\n                        cache(key, unit, _this.t(m_1, unit), null);\n                        resolve(key);\n                    };\n                    m_1.src = texture.src;\n                }\n            });\n        };\n        Promise.all(Object.keys(assets).map(function (key) {\n            return p(key, assets[key]);\n        })).then(function (result) {\n            cb();\n        }).catch(function (ex) {\n            console.log(ex);\n        });\n        return this;\n    };\n    DR.prototype.aB = function (name, vertex, fragment, textures, customUniforms) {\n        var _this = this;\n        var gl = this.gl;\n        var target = this.cT(this.canvas.width, this.canvas.height, textures ? textures : [], customUniforms ? customUniforms : {});\n        this.targets.set(name, target);\n        var program = this.aP(name);\n        this.cS(program, 35633, this.header + vertex);\n        this.cS(program, 35632, this.header + fragment);\n        gl.linkProgram(program);\n        gl.validateProgram(program);\n        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\n            var info = gl.getProgramInfoLog(program);\n            throw 'Could not compile WebGL program. \\n\\n' + info;\n        }\n        gl.useProgram(program);\n        if (textures) {\n            textures.forEach(function (tk) {\n                gl.bindTexture(3553, _this.textureCache.get(tk).src);\n            });\n        }\n        this.vertexPosition = gl.getAttribLocation(program, \"pos\");\n        gl.enableVertexAttribArray(this.vertexPosition);\n        var nu = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\n        for (var i = 0; i < nu; ++i) {\n            var u = gl.getActiveUniform(program, i);\n            target.locations.set(u.name, gl.getUniformLocation(program, u.name));\n        }\n        return this;\n    };\n    DR.prototype.R = function (time) {\n        var _this = this;\n        var gl = this.gl;\n        var main = this.mainProgram;\n        var tc = 0;\n        this.programs.forEach(function (current, key) {\n            gl.useProgram(current);\n            var target = _this.targets.get(key);\n            gl.uniform2f(target.locations.get(\"resolution\"), _this.canvas.width, _this.canvas.height);\n            gl.uniform1f(target.locations.get(\"time\"), time);\n            var customUniforms = target.uniforms;\n            customUniforms && Object.keys(customUniforms).forEach(function (v) {\n                customUniforms[v](target.locations.get(v), gl, current, time);\n            });\n            target.textures.forEach(function (tk, index) {\n                var ct = _this.textureCache.get(tk);\n                ct.fn &&\n                    ct.fn(gl, ct.src);\n                var loc = gl.getUniformLocation(current, tk);\n                gl.uniform1i(loc, index);\n                gl.activeTexture(ct.num);\n                gl.bindTexture(gl.TEXTURE_2D, ct.src);\n                tc++;\n            });\n            gl.bindBuffer(34962, _this.surfaceBuffer);\n            gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);\n            gl.bindBuffer(34962, _this.buffer);\n            gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);\n            gl.bindFramebuffer(36160, target.framebuffer);\n            gl.clear(16384 | 256);\n            gl.drawArrays(4, 0, 6);\n        });\n        gl.useProgram(main);\n        gl.uniform2f(gl.getUniformLocation(main, \"resolution\"), this.canvas.width, this.canvas.height);\n        gl.uniform1f(gl.getUniformLocation(main, \"time\"), time);\n        Object.keys(this.cU).forEach(function (v) {\n            _this.cU[v](gl.getUniformLocation(main, v), gl, main, time);\n        });\n        gl.bindBuffer(34962, this.buffer);\n        gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);\n        this.targets.forEach(function (target, key) {\n            gl.uniform1i(gl.getUniformLocation(main, key), tc);\n            gl.activeTexture(33984 + tc);\n            gl.bindTexture(3553, target.texture);\n            tc++;\n        });\n        gl.bindFramebuffer(36160, null);\n        gl.clear(16384 | 256);\n        gl.drawArrays(4, 0, 6);\n    };\n    DR.prototype.cT = function (width, height, textures, customUniforms) {\n        var gl = this.gl;\n        var target = {\n            \"framebuffer\": gl.createFramebuffer(),\n            \"renderbuffer\": gl.createRenderbuffer(),\n            \"texture\": gl.createTexture(),\n            \"textures\": textures,\n            \"uniforms\": customUniforms,\n            \"locations\": new Map()\n        };\n        gl.bindTexture(3553, target.texture);\n        gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 5121, null);\n        gl.texParameteri(3553, 10242, 33071);\n        gl.texParameteri(3553, 10243, 33071);\n        gl.texParameteri(3553, 10240, 9728);\n        gl.texParameteri(3553, 10241, 9728);\n        gl.bindFramebuffer(36160, target.framebuffer);\n        gl.framebufferTexture2D(36160, 36064, 3553, target.texture, 0);\n        gl.bindRenderbuffer(36161, target.renderbuffer);\n        gl.renderbufferStorage(36161, 33189, width, height);\n        gl.framebufferRenderbuffer(36160, 36096, 36161, target.renderbuffer);\n        gl.bindTexture(3553, null);\n        gl.bindRenderbuffer(36161, null);\n        gl.bindFramebuffer(36160, null);\n        return target;\n    };\n    DR.prototype.run = function (t, fps) {\n        var _this = this;\n        var pt = performance.now();\n        var interval = 1000 / fps;\n        var dt = 0;\n        var a = function (t) {\n            requestAnimationFrame(a);\n            dt = t - pt;\n            _this.textureCache;\n            if (dt > interval) {\n                pt = t - (dt % interval);\n                _this.R(pt / 1000);\n            }\n        };\n        a(t | 0);\n        return this;\n    };\n    return DR;\n}());\nexports.DR = DR;\n\n\n//# sourceURL=webpack:///./node_modules/demolishedrenderer/src/DR.js?");

/***/ }),

/***/ "./src/GreenScreenStream.js":
/*!**********************************!*\
  !*** ./src/GreenScreenStream.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst demolishedrenderer_1 = __webpack_require__(/*! demolishedrenderer */ \"./node_modules/demolishedrenderer/index.js\");\nclass GreenScreenStream {\n    constructor(backgroudImage, canvas, width, height) {\n        this.mainFrag = `uniform vec2 resolution;\n    uniform sampler2D A;\n    out vec4 fragColor;\n    void main(){\n        vec2 uv = gl_FragCoord.xy/resolution.xy;\n        \n        fragColor = texture(A, uv);\n    }`;\n        this.mainVert = `layout(location = 0) in vec2 pos; \n    out vec4 fragColor;                \n    void main() { \n        gl_Position = vec4(pos.xy,0.0,1.0);\n    }    \n    `;\n        this.bufferFrag = `uniform float time;\n    uniform vec2 resolution;   \n    uniform sampler2D webcam;\n    uniform sampler2D background;\n    out vec4 fragColor;\n\n    void mainImage( out vec4 fragColor, in vec2 fragCoord )\n    {\n\tconst int samples = 10;\n\tconst float dp = 0.1;\n\tfloat rad = 0.02;\n    vec2 uv = 1. -fragCoord.xy / resolution.xy;\n\n    vec4 fg = texture(webcam,uv);\n\tvec4 bg = texture(background,-uv);\t\n\tvec3 blur = vec3(0.0);\n\tfor (int i = -samples; i < samples; i++)\n\t{\n\t\tfor (int j = -samples; j < samples; j++)\n\t\t{\n\t\t\tblur += texture(webcam, uv + vec2(i, j) * (rad/float(samples))).xyz\n\t\t\t\t / pow(float(samples) * 2.0, 2.0);\n\t\t}\n\t}\n\tvec4 raw = vec4 (vec3(blur[1]-blur[0]),1.0);\n\n\tvec4 normal = clamp((1.0-(raw*10.0)),0.0,1.0);\n\n\tfg.g = clamp (fg.g, 0.0, fg.r-dp);\n\n\n\tfragColor = (normal * fg)+((1.0-normal) * bg);\n}\n\n    void main(){    \n        mainImage(fragColor,gl_FragCoord.xy);\n      \n    }`;\n        if (canvas) {\n            this.canvas = canvas;\n        }\n        else {\n            this.canvas = document.createElement(\"canvas\");\n            this.canvas.width = width || 800;\n            this.canvas.height = height || 450;\n        }\n        this.ctx = this.canvas.getContext(\"webgl2\");\n        this.mediaStream = new MediaStream();\n        this.renderer = new demolishedrenderer_1.DR(this.canvas, this.mainVert, this.mainFrag);\n        this.renderer.aA({\n            \"background\": {\n                num: 33985,\n                src: backgroudImage\n            },\n            \"webcam\": {\n                num: 33984,\n                fn: (gl, texture) => {\n                    gl.bindTexture(gl.TEXTURE_2D, texture);\n                    gl.texImage2D(3553, 0, 6408, 6408, 5121, this.video);\n                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n                }\n            }\n        }, () => {\n            this.renderer.aB(\"A\", this.mainVert, this.bufferFrag, [\"webcam\", \"background\"]);\n        });\n    }\n    render(fps) {\n        this.renderer.run(0, fps || 25);\n    }\n    addVideoTrack(track) {\n        this.mediaStream.addTrack(track);\n        this.video = document.createElement(\"video\");\n        this.video.autoplay = true;\n        this.video.srcObject = this.mediaStream;\n        this.video.play();\n    }\n    captureStream(fps) {\n        return this.canvas[\"captureStream\"](fps || 25);\n    }\n    static getInstance(backgroudImage, canvas, width, height) {\n        return new GreenScreenStream(backgroudImage, canvas, width, height);\n    }\n}\nexports.GreenScreenStream = GreenScreenStream;\n\n\n//# sourceURL=webpack:///./src/GreenScreenStream.js?");

/***/ })

/******/ });