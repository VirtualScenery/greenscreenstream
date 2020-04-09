uniform float time;
    uniform vec2 resolution;   
    uniform sampler2D webcam;
    uniform sampler2D background;
    uniform vec4 chromakey; 
    uniform vec2 maskRange;
    out vec4 fragColor;

vec3 rgb2hsv(vec3 rgb)
{
	float cmax = max(rgb.r, max(rgb.g, rgb.b));
	float cmin = min(rgb.r, min(rgb.g, rgb.b));
    float delta = cmax - cmin;

	vec3 hsv = vec3(0., 0., cmax);
	
	if (cmax > cmin)
	{
		hsv.y = delta / cmax;

		if (rgb.r == cmax)
			hsv.x = (rgb.g - rgb.b) / delta;
		else
		{
			if (rgb.g == cmax)
				hsv.x = 2. + (rgb.b - rgb.r) / delta;
			else
				hsv.x = 4. + (rgb.r - rgb.g) / delta;
		}
		hsv.x = fract(hsv.x / 6.);
	}
	return hsv;
}

float chromakey(vec3 color)
{
	vec3 backgroundColor = vec3(0.157, 0.576, 0.129);
	vec3 weights = vec3(4., 1., 2.);

	vec3 hsv = rgb2hsv(color);
	vec3 target = rgb2hsv(backgroundColor);
	float dist = length(weights * (target - hsv));
	return 1. - clamp(3. * dist - 1.5, 0., 1.);
}

vec3 saturation(vec3 color, float saturation)
{
	float luma = dot(vec3(0.213, 0.715, 0.072) * color, vec3(1.));
	return mix(vec3(luma), color, saturation);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / resolution.xy;
	
	vec3 color = texture(webcam, uv).rgb;
	vec3 bg = texture(iChannel1, -uv).rgb;
	
	float incrustation = chromakey(color);
	
	color = saturation(color, 0.9);
	color = mix(color, bg, incrustation);

	fragColor = vec4(color, 1.);
}

void main(){    
    mainImage(fragColor,gl_FragCoord.xy);      
}