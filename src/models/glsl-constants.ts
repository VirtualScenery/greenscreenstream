/**
 * GLSL fragment shader source code as a string.
 *
 * This shader samples a texture (`A`) using normalized screen coordinates
 * and outputs the resulting color to `fragColor`.
 *
 * Uniforms:
 * - `resolution`: The resolution of the output in pixels (vec2).
 * - `A`: The input texture (sampler2D).
 *
 * Usage:
 * Assign this constant to a shader program that expects the above uniforms.
 */
export const MAIN_FRAG: string = `

    uniform vec2 resolution;
    uniform sampler2D A;
    out vec4 fragColor;
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        fragColor = texture(A, uv);
    }
`;

/**
 * GLSL vertex shader source code for the main vertex shader.
 *
 * This shader takes a 2D position attribute (`pos`) as input and sets the `gl_Position`
 * for rendering. It also declares an output variable `fragColor`, though it is not assigned
 * in this shader. The shader is intended for use in rendering full-screen quads or similar
 * geometry where only position is required.
 *
 * @remarks
 * - `layout(location = 0) in vec2 pos;` specifies the input attribute location.
 * - `gl_Position` is set using the input position with z = 0.0 and w = 1.0.
 * - The output `fragColor` is declared for compatibility with fragment shaders.
 */
export const MAIN_VERT: string = `
    layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
`;
/**
 * GLSL vertex shader source code for a simple buffer.
 *
 * This shader takes a 2D position attribute (`pos`) as input and sets the `gl_Position`
 * for each vertex. It also declares an output variable `fragColor`, which can be used
 * in the fragment shader stage. The shader is intended for use in rendering full-screen
 * quads or similar geometry where only position data is required.
 *
 * @remarks
 * - The input attribute `pos` is expected at location 0.
 * - The output `fragColor` is declared but not assigned in this shader; it is typically
 *   used in the fragment shader.
 */
export const BUFFER_VERT: string = `
    layout(location = 0) in vec2 pos;
    out vec4 fragColor;
    void main() {
        gl_Position = vec4(pos.xy,0.0,1.0);
    }
`;

/**
 * GLSL fragment shader source for chroma key compositing.
 *
 * This shader blends a foreground (webcam) texture with a background texture
 * using chroma keying (typically for green screen effects). It converts colors
 * from RGB to YUV space to perform color similarity checks, allowing for
 * configurable tolerance via the `maskRange` uniform.
 *
 * Uniforms:
 * - `time`: Current time (unused in this shader).
 * - `resolution`: The resolution of the output image.
 * - `webcam`: Foreground texture (e.g., webcam feed).
 * - `background`: Background texture to composite behind the foreground.
 * - `chromaKey`: The chroma key color to remove (in RGBA).
 * - `maskRange`: vec2 specifying the inner and outer tolerance for chroma keying.
 *
 * Outputs:
 * - `fragColor`: The final composited color for each fragment.
 *
 * The shader uses a helper function `colorclose` to determine how close a pixel's
 * color is to the chroma key color in YUV space, and blends the foreground and
 * background accordingly.
 */
export const BUFFER_FRAG: string = `
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