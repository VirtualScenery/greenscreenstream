export interface ITexture {
        src?: any;
        fn?(prg: WebGLProgram, gl: WebGLRenderingContext, src: any): Function;
        w?: number;
        h?: number;
}

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
         * Create a Shader
         *
         * @param {WebGLProgram} program
         * @param {number} type
         * @param {string} source
         * @memberof DemolishedRenderer
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
         * Create and add a WebGLProgram
         *
         * @param {string} name
         * @returns {WebGLProgram}
         * @memberof DemolishedRenderer
         */
        public addProgram(name: string): WebGLProgram {
                let p = this.gl.createProgram();
                this.programs.set(name, { program: p, state: true });
                return p;
        }
        /**
         *  Create a new WEBGLTexture
         *
         * @param {*} data  image or UInt8Array
         * @returns WebGLTexture
         * @memberof DemolishedRenderer
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
         * Create a texture cube map
         *
         * @param {Array<any>} sources
         * @param {number} d
         * @returns {WebGLTexture}
         * @memberof DemolishedRenderer
         */
        createTextureCubeMap(sources: Array<any>, d: number): WebGLTexture {
                let gl = this.gl;
                let texture = gl.createTexture();
                gl.activeTexture(33985 + d);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                const fetchAll = (src: string, key: string) => {
                        return new Promise<any>(async (resolve, reject) => {


                                const response = await fetch(src)
                                const blob = await response.blob()

                                let image = new Image();
                                image.dataset.key = key

                                image.onerror = reject;

                                image.onload = () => {
                                        resolve(image);
                                }

                                image.src = src;
                        });
                };
                Promise.all(sources.map(i => {
                        return fetchAll(i.d, i.t);
                })).then(data => {
                        data.forEach(image => {
                                const target = image.dataset.key
                                const level = 0;
                                const internalFormat = gl.RGBA;
                                const width = 512;
                                const height = 512;
                                const format = gl.RGBA;
                                const type = gl.UNSIGNED_BYTE;
                                gl.texImage2D(target,
                                        level, internalFormat,
                                        width, height, 0, format, type, null);
                                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                                gl.texImage2D(target, level, internalFormat, format, type, image);
                                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                        });
                });
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                return texture;
        }
        /**
         * add assets ( textures )
         *
         * @param {*} assets
         * @param {()=>void} cb
         * @returns {this}
         * @memberof DemolishedRenderer
         */
        addAssets(assets: any, cb: (r?: any) => void): this {
                const cache = (k, v, f) => {
                        this.textureCache.set(k, { src: v, fn: f });
                }
                const p = (key: string, texture: any, unit: number) => {
                        return new Promise<any>((resolve) => {
                                if (!texture.src) {
                                        cache(key, this.createTexture(new Uint8Array(1024), unit), texture.fn);
                                        resolve(key);
                                } else {
                                        if (!Array.isArray(texture.src)) {
                                                const i = new Image();
                                                i.onload = (e) => {
                                                        cache(key, this.createTexture(i, unit), null);
                                                        resolve(key)
                                                };
                                                i.src = texture.src;
                                        } else {

                                                cache(key, this.createTextureCubeMap(texture.src as Array<any>, unit),
                                                        texture.fn);
                                                resolve(key);
                                        }
                                }
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
         * add a new buffer / shader program
         *
         * @param {string} name
         * @param {string} vertex
         * @param {string} fragment
         * @param {Array<string>} [textures]
         * @param {*} [customUniforms]
         * @returns {this}
         * @memberof DemolishedRenderer
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
         * Set program state ( enable / or disable)
         *   
         * @param {string} key
         * @param {boolean} state
         * @memberof DemolishedRenderer
         */
        setProgram(key: string, state: boolean): void {
                this.programs.get(key).state = state;
        }

        /**
         * Render
         *
         * @param {number} time
         * @memberof DemolishedRenderer
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
         * Create render target
         *
         * @param {number} width
         * @param {number} height
         * @param {Array<string>} textures
         * @returns {*}
         * @memberof DemolishedRenderer
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
         * Render loop
         *
         * @param {number} t
         * @param {number} fps
         * @returns {this}
         * @memberof DemolishedRenderer
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

        /**
         *  Generate a texture and return a canvas element
         *
         * @static
         * @param {string} mainVertex
         * @param {string} mainFrag
         * @param {string} textureVertex
         * @param {*} textureFrag
         * @param {number} w
         * @param {number} h
         * @returns {HTMLCanvasElement}
         * @memberof DemolishedRenderer
         */
        static generateTexture(mainVertex: string, mainFrag: string,
                textureVertex: string,
                textureFrag, w: number, h: number): HTMLCanvasElement {
                let canvas = document.createElement("canvas") as HTMLCanvasElement;
                canvas.width = w; canvas.height = h;
                let dr = new DemolishedRenderer(canvas, mainVertex, mainFrag);
                dr.addBuffer("A", textureVertex, textureFrag);
                // do a few frames due to back buffer.
                for (var i = 0; i < 2; i++) {
                        dr.render(i);
                }
                return canvas;
        }

}