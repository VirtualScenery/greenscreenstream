/**
 * Represents a texture resource used in WebGL rendering.
 *
 * @property {any} [src] - The source data for the texture. This could be an image, video, or other data type compatible with WebGL textures.
 * @property {(prg: WebGLProgram, gl: WebGLRenderingContext, src: any) => Function} [fn] - 
 *   An optional function that processes the texture. It receives the WebGL program, rendering context, and source data,
 *   and returns a function (typically for cleanup or further processing).
 * @property {number} [w] - The width of the texture in pixels.
 * @property {number} [h] - The height of the texture in pixels.
 */
export interface ITexture {
        src?: any;
        fn?(prg: WebGLProgram, gl: WebGLRenderingContext, src: any): Function;
        w?: number;
        h?: number;
}

/**
 * Represents a render target in a WebGL context, encapsulating the framebuffer, renderbuffer, and texture objects.
 * Also manages associated textures, uniforms, and uniform locations for shader programs.
 *
 * @remarks
 * This class is designed to simplify the management of WebGL rendering targets and their related resources.
 *
 * @property framebuffer - The WebGLFramebuffer used as the rendering destination.
 * @property renderbuffer - The WebGLRenderbuffer used for depth or stencil attachments.
 * @property texture - The primary WebGLTexture attached to the framebuffer.
 * @property textures - An array of texture identifiers or URLs associated with this render target.
 * @property uniforms - An object containing custom uniform values to be used in shaders.
 * @property locations - A map of uniform names to their corresponding WebGLUniformLocation objects.
 *
 * @constructor
 * @param gl - The WebGL rendering context.
 * @param textures - An array of texture identifiers or URLs to associate with this render target.
 * @param customUniforms - An object containing custom uniform values for shader programs.
 */
export class RenderTarget {
        framebuffer: WebGLFramebuffer;
        renderbuffer: WebGLRenderbuffer;
        texture: WebGLTexture;
        textures: Array<string>;
        uniforms: any;
        locations: Map<string, WebGLUniformLocation>;

        constructor(gl: WebGLRenderingContext, textures: string[], customUniforms: any) {
                this.textures = new Array<string>();
                this.locations = new Map<string, WebGLUniformLocation>();
                this.framebuffer = gl.createFramebuffer();
                this.renderbuffer = gl.createRenderbuffer();
                this.texture = gl.createTexture();
                this.textures = textures;
                this.uniforms = customUniforms;
        }
}

/**
 * The `DemolishedRenderer` class provides a high-level abstraction for managing and rendering WebGL2-based graphics pipelines.
 * It supports multiple shader programs, render targets, texture management (including cube maps), and custom uniforms.
 * 
 * ## Features
 * - Initializes and manages a WebGL2 rendering context.
 * - Compiles and links vertex and fragment shaders, with support for custom shader headers.
 * - Manages multiple shader programs and their states.
 * - Handles creation and caching of 2D and cube map textures.
 * - Supports render targets with custom framebuffers and renderbuffers.
 * - Allows dynamic addition of assets (textures) and shader buffers.
 * - Provides a render loop with a configurable frame rate.
 * - Exposes a static utility to generate textures via offscreen rendering.
 * 
 * ## Usage
 * Instantiate with a target HTMLCanvasElement and shader sources, then add buffers, assets, and start the render loop.
 * 
 * @example
 * ```typescript
 * const renderer = new DemolishedRenderer(canvas, vertexShaderSrc, fragmentShaderSrc);
 * renderer.addAssets({ ... }, () => {
 *   renderer.addBuffer("bufferA", bufferVertexSrc, bufferFragmentSrc);
 *   renderer.run(0, 60);
 * });
 * ```
 * 
 * @public
 */
export class DemolishedRenderer {
        gl: WebGLRenderingContext;
        mainProgram: WebGLProgram;
        programs: Map<string, { program: WebGLProgram, state: boolean }>;
        surfaceBuffer: WebGLBuffer;
        textureCache: Map<string, ITexture>;
        targets: Map<string, RenderTarget>;
        mainUniforms: Map<string, WebGLUniformLocation>
        buffer: WebGLBuffer;
        vertexPosition: number;
        screenVertexPosition: number;
        frameCount: number = 0;
        deltaTime: number = 0;

        header: string =
                `#version 300 es
        #ifdef GL_ES
        precision highp float;
        precision highp int;
        precision mediump sampler3D;
        #endif`;

        /**
         * Initializes a new instance of the DemolishedRenderer class.
         *
         * @param canvas - The HTMLCanvasElement to use as the rendering target.
         * @param v - The source code for the vertex shader.
         * @param f - The source code for the fragment shader.
         * @param cU - (Optional) An object containing custom uniforms to be used in the shaders.
         *
         * Sets up WebGL context, compiles and links shaders, initializes buffers, and prepares uniforms and attributes for rendering.
         * Throws an error if the shader program fails to compile or link.
         */
        constructor(public canvas: HTMLCanvasElement, v: string, f: string, public cU: any = {}) {

                this.targets = new Map<string, any>();
                this.mainUniforms = new Map<string, WebGLUniformLocation>();

                this.programs = new Map<string, { program: WebGLProgram, state: boolean }>();
                this.textureCache = new Map<string, ITexture>();

                let gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true }) as WebGLRenderingContext;

                // hash each method of gl, shorten the names , so we can save a few bytes.
                let c = 0, d: any; for (let i in gl) "function" == typeof gl[i] && (d = (c++ & 255).toString(16), d = d.match(/^[0-9].*$/) ? "x" + d : d, gl[d] = gl[i]);

                this.gl = gl;

                let mp = gl.createProgram();

                this.mainProgram = mp;

                gl.viewport(0, 0, canvas.width, canvas.height);

                this.buffer = gl.createBuffer();
                this.surfaceBuffer = gl.createBuffer();

                this.createShader(mp, 35633, this.header + v);
                this.createShader(mp, 35632, this.header + f);

                gl.linkProgram(mp);
                gl.validateProgram(mp);

                if (!gl.getProgramParameter(mp, gl.LINK_STATUS)) {
                        var info = gl.getProgramInfoLog(mp);
                        throw 'Could not compile main program. \n\n' + info;
                }
                gl.useProgram(mp);

                for (let i = 0; i < gl.getProgramParameter(mp, gl.ACTIVE_UNIFORMS); ++i) {
                        const u: any = gl.getActiveUniform(mp, i);
                        this.mainUniforms.set(u.name, gl.getUniformLocation(mp, u.name));
                }

                this.screenVertexPosition = gl.getAttribLocation(mp, "pos");
                gl.enableVertexAttribArray(this.screenVertexPosition);

                gl.bindBuffer(34962, this.buffer);
                gl.bufferData(34962, new Float32Array([- 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0]), 35044);
        }


        /**
         * Compiles a shader from the provided source code and attaches it to the given WebGL program.
         *
         * @param program - The WebGLProgram to which the compiled shader will be attached.
         * @param type - The type of shader to create (e.g., gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
         * @param source - The GLSL source code for the shader.
         * @throws Will throw an error if the shader fails to compile, including the compilation log.
         */
        public createShader(program: WebGLProgram, type: number, source: string): void {
                let gl = this.gl;
                let shader = gl.createShader(type)
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                gl.attachShader(program, shader);
                if (!gl.getShaderParameter(shader, 35713)) { // this.gl.COMPILE_STATUS
                        gl.getShaderInfoLog(shader).trim().split("\n").forEach((l: string) =>
                                console.error("[shader] " + l))
                        throw new Error("Error while compiling vertex/fragment" + source)
                };
        }


        /**
         * Creates a new WebGL program, stores it in the internal programs map with the given name,
         * and returns the created program.
         *
         * @param name - The unique identifier for the WebGL program.
         * @returns The created WebGLProgram instance.
         */
        public addProgram(name: string): WebGLProgram {
                let p = this.gl.createProgram();
                this.programs.set(name, { program: p, state: true });
                return p;
        }
        /**
         * Creates a WebGL texture from the provided image or pixel data.
         *
         * @param data - The source data for the texture, either an `HTMLImageElement` or a `Uint8Array` containing pixel data.
         * @param d - The texture unit index to activate before binding the texture.
         * @returns The created `WebGLTexture` object.
         */
        public createTexture(data: HTMLImageElement | Uint8Array, d: number): WebGLTexture {
                let gl = this.gl;
                let texture = gl.createTexture();
                gl.activeTexture(33985 + d);
                gl.bindTexture(3553, texture);
                if (data instanceof Image) {
                        gl.texImage2D(3553, 0, 6408, 6408, 5121, data);
                } else {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                                1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                                data)
                }
                gl.generateMipmap(3553);
                return texture;
        }

        /**
         * Creates a cube map texture from an array of image sources.
         *
         * @param sources - An array of objects containing the source URLs and target keys for each face of the cube map.
         * @param d - The texture unit index to activate before binding the cube map texture.
         * @returns The created `WebGLTexture` object representing the cube map.
         */
        addAssets(assets: any, cb: (r?: any) => void): this {
                const cache = (k, v, f) => {
                        this.textureCache.set(k, { src: v, fn: f });
                }
                const p = (key: string, texture: any, unit: number) => {
                        return new Promise<any>((resolve) => {

                                cache(key, this.createTexture(new Uint8Array(1024), unit), texture.fn);
                                resolve(key);

                        });
                }
                Promise.all(Object.keys(assets).map((key: string, index: number) => {
                        return p(key, assets[key], index);
                })).then((result: any) => {
                        cb(result);
                }).catch((err) => {
                        console.error(err)
                });
                return this;
        }
        /**
         * Creates a cube map texture from an array of image sources.
         *
         * @param sources - An array of objects containing the source URLs and target keys for each face of the cube map.
         * @param d - The texture unit index to activate before binding the cube map texture.
         * @returns The created `WebGLTexture` object representing the cube map.
         */
        addBuffer(name: string, vertex: string, fragment: string, textures?: Array<string>, customUniforms?: any): DemolishedRenderer {
                let gl = this.gl;

                let tA = this.createRenderTarget(this.canvas.width, this.canvas.height, textures ? textures : [], customUniforms ? customUniforms : {});
                let tB = this.createRenderTarget(this.canvas.width, this.canvas.height, textures ? textures : [], customUniforms ? customUniforms : {});

                this.targets.set(name, tA);
                this.targets.set(`_${name}`, tB)

                let program = this.addProgram(name);

                this.createShader(program, 35633, this.header + vertex);
                this.createShader(program, 35632, this.header + fragment);

                gl.linkProgram(program);
                gl.validateProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        var info = gl.getProgramInfoLog(program);
                        throw `Could not compile ${name} program. \n\n${info}`
                }

                gl.useProgram(program);

                if (textures) {
                        textures.forEach((tk: string) => {
                                gl.bindTexture(3553, this.textureCache.get(tk).src);
                        });
                }
                this.vertexPosition = gl.getAttribLocation(program, "pos");
                gl.enableVertexAttribArray(this.vertexPosition);
                for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); ++i) {
                        const u: any = gl.getActiveUniform(program, i);
                        tA.locations.set(u.name, gl.getUniformLocation(program, u.name));
                }
                return this;
        }

        /**
         * Sets the state of a program to either enabled or disabled.
         *
         * @param {string} key - The unique identifier for the program.
         * @param {boolean} state - The desired state of the program (true for enabled, false for disabled).
         */
        setProgram(key: string, state: boolean): void {
                this.programs.get(key).state = state;
        }

        /**
         * Renders the scene using the current WebGL context and shader programs.
         *
         * @param {number} time - The current time in seconds, used for animations and time-based effects.
         * 
         * This method iterates through all registered shader programs, binds the appropriate textures,
         * sets uniforms, and draws the geometry to the screen. It also handles framebuffers for offscreen rendering.
         */
        render(time: number) {
                let gl = this.gl;
                let main = this.mainProgram;
                let tc = 0;
                this.programs.forEach((l: { program: WebGLProgram, state: boolean }, key: string) => {
                        if (!l.state) return; // do not render 
                        const current = l.program;
                        let fT = this.targets.get(key);
                        let bT = this.targets.get(`_${key}`);
                        gl.useProgram(current);
                        // resolution, time
                        gl.uniform2f(fT.locations.get("resolution"), this.canvas.width, this.canvas.height);
                        gl.uniform1f(fT.locations.get("time"), time);
                        gl.uniform1f(fT.locations.get("deltaTime"), this.frameCount);
                        gl.uniform1f(fT.locations.get("frame"), this.frameCount);
                        let customUniforms = fT.uniforms;
                        customUniforms && Object.keys(customUniforms).forEach((v: string) => {
                                customUniforms[v](fT.locations.get(v), gl, current, time);
                        });
                        let bl = gl.getUniformLocation(current, key); // todo: get this from cache?

                        gl.uniform1i(bl, 0);
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, bT.texture)


                        fT.textures.forEach((tk: string, index: number) => {
                                let ct = this.textureCache.get(tk);
                                gl.activeTexture(33985 + index);
                                gl.bindTexture(gl.TEXTURE_2D, ct.src)
                                if (ct.fn)
                                        ct.fn(current, gl, ct.src);
                                let loc = gl.getUniformLocation(current, tk); // todo: get this from cache?  

                                gl.uniform1i(loc, index + 1);
                                tc++;
                        });

                        gl.bindBuffer(34962, this.surfaceBuffer);
                        gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                        gl.bindBuffer(34962, this.buffer);
                        gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                        gl.bindFramebuffer(36160, fT.framebuffer);

                        gl.clear(16384 | 256);
                        gl.drawArrays(4, 0, 6);

                        bT = fT;
                        fT = bT;

                });

                gl.useProgram(main);
                gl.uniform2f(this.mainUniforms.get("resolution"), this.canvas.width, this.canvas.height);
                gl.uniform1f(this.mainUniforms.get("time"), time);

                // todo:  set up a cache for custom uniforms
                Object.keys(this.cU).forEach((v: string) => {
                        this.cU[v](gl.getUniformLocation(main, v), gl, main, time); // todo: use cached locations
                });

                gl.bindBuffer(34962, this.buffer);
                gl.vertexAttribPointer(0, 2, 5126, false, 0, 0);

                this.targets.forEach((target: any, key: string) => {
                        gl.uniform1i(gl.getUniformLocation(main, key), tc); // todo: use cached locations
                        gl.activeTexture(33984 + tc);
                        gl.bindTexture(3553, target.texture);
                        tc++;
                });

                gl.bindFramebuffer(36160, null);
                gl.clear(16384 | 256);
                gl.drawArrays(4, 0, 6);
                this.frameCount++;
                this.deltaTime = -(this.deltaTime - time);
        }

        /**
         * Creates a render target with a framebuffer, renderbuffer, and texture.
         *
         * @param {number} width - The width of the render target in pixels.
         * @param {number} height - The height of the render target in pixels.
         * @param {Array<string>} textures - An array of texture identifiers or URLs to associate with this render target.
         * @param {any} customUniforms - An object containing custom uniform values for shader programs.
         * @returns {RenderTarget} The created RenderTarget instance.
         */

        createRenderTarget(width: number, height: number, textures: Array<string>, customUniforms: any): RenderTarget {
                let gl = this.gl;
                let target = new RenderTarget(gl, textures, customUniforms);

                gl.bindTexture(3553, target.texture);
                gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 5121, null);

                gl.texParameteri(3553, 10242, 33071);
                gl.texParameteri(3553, 10243, 33071);

                gl.texParameteri(3553, 10240, 9728);
                gl.texParameteri(3553, 10241, 9728);

                gl.bindFramebuffer(36160, target.framebuffer);
                gl.framebufferTexture2D(36160, 36064, 3553, target.texture, 0);
                gl.bindRenderbuffer(36161, target.renderbuffer);

                gl.renderbufferStorage(36161, 33189, width, height);
                gl.framebufferRenderbuffer(36160, 36096, 36161, target.renderbuffer);

                gl.bindTexture(3553, null);
                gl.bindRenderbuffer(36161, null);
                gl.bindFramebuffer(36160, null);

                return target;
        }


        /**
         * Starts the rendering loop at a specified frame rate.
         *
         * @param {number} t - The initial time in milliseconds to start the rendering loop.
         * @param {number} fps - The desired frames per second for the rendering loop.
         * @returns {this} The current instance of the DemolishedRenderer for method chaining.
         */

        run(t: number, fps: number): this {
                let pt: number = performance.now();
                let interval = 1000 / fps;
                let dt = 0;
                const a = (t: number) => {
                        requestAnimationFrame(a);
                        dt = t - pt;
                        if (dt > interval) {
                                pt = t - (dt % interval);
                                this.render(pt / 1000);
                        }
                };
                a(t | 0);
                return this;

        }


}