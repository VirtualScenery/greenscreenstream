"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUFFER_FRAG = exports.BUFFER_VERT = exports.MAIN_VERT = exports.MAIN_FRAG = void 0;
exports.MAIN_FRAG = `

    uniform vec2 resolution;
    uniform sampler2D A;
    out vec4 fragColor;
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        fragColor = texture(A, uv);
    }
`;
exports.MAIN_VERT = `
    layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
`;
exports.BUFFER_VERT = `
    layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
`;
exports.BUFFER_FRAG = `
    uniform float time;
    uniform vec2 resolution;
    uniform sampler2D webcam;
    uniform sampler2D background;
    uniform vec4 chromaKey;
    uniform vec2 maskRange;
    out vec4 fragColor;

    mat4 RGBtoYUV = mat4(
        0.257,  0.439, -0.148, 0.0,
        0.504, -0.368, -0.291, 0.0,
        0.098, -0.071,  0.439, 0.0,
        0.0625, 0.500,  0.500, 1.0 
    );

    float colorclose(vec3 yuv, vec3 keyYuv, vec2 tol)
    {
        float tmp = sqrt(pow(keyYuv.g - yuv.g, 2.0) + pow(keyYuv.b - yuv.b, 2.0));
        if (tmp < tol.x)
        return 0.0;
        else if (tmp < tol.y)
        return (tmp - tol.x)/(tol.y - tol.x);
        else
        return 1.0;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 fragPos =  1. - fragCoord.xy / resolution.xy;
      
        vec4 fg = texture(webcam, vec2(1.-fragPos.x,fragPos.y));
        vec4 bg = texture(background, vec2(1.-fragPos.x,fragPos.y));

        vec4 keyYUV =  RGBtoYUV * chromaKey;
        vec4 yuv = RGBtoYUV * fg;

        float mask = 1.0 - colorclose(yuv.rgb, keyYUV.rgb, maskRange);

        fragColor = max(fg - mask * chromaKey, 0.0) + bg * mask;
    }

    void main(){
        mainImage(fragColor,gl_FragCoord.xy);
    }
`;
