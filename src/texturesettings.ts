export type ImageTextureSettings = {
    background: {
        unit: number,
        src: string
    }
    webcam: {
        unit: number,
        fn: Function
    }
}

export type VideoTextureSettings = {
    background: {
        unit: number,
        fn: Function
    }
    webcam: {
        unit: number,
        fn: Function
    }
}

export function getImageTextureSettings(backgroundUrl: string, cameraSource: HTMLVideoElement | HTMLCanvasElement): ImageTextureSettings {
    return {
        "background": {
            unit: 33985,
            src: backgroundUrl
        },
        "webcam": {
            unit: 33986,
            fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, 6408, 6408, 5121, cameraSource);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        }
    }
}

export function getVideoTextureSettings(backgroundSource: any, cameraSource: HTMLVideoElement | HTMLCanvasElement): VideoTextureSettings {
    return {
        "background": {
            unit: 33985,
            fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(3553, 0, 6408, 6408, 5121, backgroundSource);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        },
        "webcam": {
            unit: 33986,
            fn: (_prg: WebGLProgram, gl: WebGLRenderingContext, texture: WebGLTexture) => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(3553, 0, 6408, 6408, 5121, cameraSource);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        }
    }
}