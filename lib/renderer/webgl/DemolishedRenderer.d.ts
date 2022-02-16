export interface ITexture {
    src?: any;
    fn?(prg: WebGLProgram, gl: WebGLRenderingContext, src: any): Function;
    w?: number;
    h?: number;
}
export declare class RenderTarget {
    framebuffer: WebGLFramebuffer;
    renderbuffer: WebGLRenderbuffer;
    texture: WebGLTexture;
    textures: Array<string>;
    uniforms: any;
    locations: Map<string, WebGLUniformLocation>;
    constructor(gl: WebGLRenderingContext, textures: string[], customUniforms: any);
}
export declare class DemolishedRenderer {
    canvas: HTMLCanvasElement;
    cU: any;
    gl: WebGLRenderingContext;
    mainProgram: WebGLProgram;
    programs: Map<string, {
        program: WebGLProgram;
        state: boolean;
    }>;
    surfaceBuffer: WebGLBuffer;
    textureCache: Map<string, ITexture>;
    targets: Map<string, RenderTarget>;
    mainUniforms: Map<string, WebGLUniformLocation>;
    buffer: WebGLBuffer;
    vertexPosition: number;
    screenVertexPosition: number;
    frameCount: number;
    deltaTime: number;
    header: string;
    constructor(canvas: HTMLCanvasElement, v: string, f: string, cU?: any);
    /**
     * Create a Shader
     *
     * @param {WebGLProgram} program
     * @param {number} type
     * @param {string} source
     * @memberof DemolishedRenderer
     */
    createShader(program: WebGLProgram, type: number, source: string): void;
    /**
     * Create and add a WebGLProgram
     *
     * @param {string} name
     * @returns {WebGLProgram}
     * @memberof DemolishedRenderer
     */
    addProgram(name: string): WebGLProgram;
    /**
     *  Create a new WEBGLTexture
     *
     * @param {*} data  image or UInt8Array
     * @returns WebGLTexture
     * @memberof DemolishedRenderer
     */
    createTexture(data: HTMLImageElement | Uint8Array, d: number): WebGLTexture;
    /**
     * Create a texture cube map
     *
     * @param {Array<any>} sources
     * @param {number} d
     * @returns {WebGLTexture}
     * @memberof DemolishedRenderer
     */
    createTextureCubeMap(sources: Array<any>, d: number): WebGLTexture;
    /**
     * add assets ( textures )
     *
     * @param {*} assets
     * @param {()=>void} cb
     * @returns {this}
     * @memberof DemolishedRenderer
     */
    addAssets(assets: any, cb: (r?: any) => void): this;
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
    addBuffer(name: string, vertex: string, fragment: string, textures?: Array<string>, customUniforms?: any): DemolishedRenderer;
    /**
     * Set program state ( enable / or disable)
     *
     * @param {string} key
     * @param {boolean} state
     * @memberof DemolishedRenderer
     */
    setProgram(key: string, state: boolean): void;
    /**
     * Render
     *
     * @param {number} time
     * @memberof DemolishedRenderer
     */
    render(time: number): void;
    /**
     * Create render target
     *
     * @param {number} width
     * @param {number} height
     * @param {Array<string>} textures
     * @returns {*}
     * @memberof DemolishedRenderer
     */
    createRenderTarget(width: number, height: number, textures: Array<string>, customUniforms: any): RenderTarget;
    /**
     * Render loop
     *
     * @param {number} t
     * @param {number} fps
     * @returns {this}
     * @memberof DemolishedRenderer
     */
    run(t: number, fps: number): this;
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
    static generateTexture(mainVertex: string, mainFrag: string, textureVertex: string, textureFrag: any, w: number, h: number): HTMLCanvasElement;
}
//# sourceMappingURL=DemolishedRenderer.d.ts.map