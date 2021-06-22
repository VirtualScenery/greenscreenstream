uniform vec2 resolution;
uniform sampler2D A;
out vec4 fragColor;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    fragColor = texture(A, uv);
}