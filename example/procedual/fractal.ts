export const FRACTAL = `
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 resolution;

    uniform sampler2D iChannel0;

    uniform sampler2D webcam;
    uniform sampler2D background;

    out vec4 fragColor;

    #define iTime time
    #define iResolution vec3(resolution,1.)

    vec2 z, v, e = vec2(.00035, -.00035);
    float t, tt, b, g, tn, szer, spa;
    vec3 np, bp, pp, po, no, ld, al, cp, op, lp, rp, fo, rd;
    mat2 r2(float r) {
        return mat2(cos(r), sin(r), -sin(r), cos(r));
    }
    float tor(vec3 p, vec2 r) {
        return length(vec2(length(p.xy) - r.x, p.z)) - r.y;
    }
    float smin(float a, float b, float k) {
        float h = max(0., k - abs(a - b));
        return min(a, b) - h * h * .25 / k;
    }
    vec2 smin2(vec2 a, vec2 b, float h) {
        float k = clamp((a.x - b.x) / h * .5 + .5, 0., 1.);
        return mix(a, b, k) - k * (1. - k) * h;
    }
    float smax(float a, float b, float k) {
        float h = max(0., k - abs(-a - b));
        return max(-a, b) + h * h * .25 / k;
    }
    vec4 texNoise(vec2 uv, sampler2D tex) {
        float f = 0.;
        f += texture(tex, uv * .125).r * .5;
        f += texture(tex, uv * .25).r * .25;
        f += texture(tex, uv * .5).r * .125;
        f += texture(tex, uv * 1.).r * .125;
        f = pow(f, 1.2);
        return vec4(f * .45 + .05);
    }
    vec2 mp(vec3 p, float ga) {
        op = p;
        vec2 h, t = vec2(tor(p, vec2(10, 1.)), 0);  // blue torus (op is "original positon of scene" which we remember here to use in lighting at end)  
        bp = p;
        bp.xy *= r2(tt * 0.2); //ORGANIC SIDE OF RING //Setup position to project along circle and then disc (so making torus)
        pp = vec3(atan(bp.x, bp.y) * 5.33, bp.z, length(bp.xy) - 10.); //pp is projection of bp along circle
        pp.yz *= r2(sin(p.x * .4) + tt * 1.);
        rp = pp; //Twist along x rotation for organic biut
        szer = (p.x * .1 + 1.) / 2.;  //sizer variable to fade shit from left to right
        np = vec3(atan(pp.y, pp.z) * 3.6, pp.x, length(pp.yz) - 1.5 + max(0., szer * 4.5)); //np is projection of pp along disc, therefore overall projection over a torus
        tn = texNoise(np.xy * .15, iChannel0).r * 2.; //Sample noise texture in da loop, along the torus projection position
        np.xy = abs(abs(abs(np.xy) - 12.) - 6.) - 3.;  // Clone np bunch of times to get more than one thing projected on torus. Let offensive than: np.xy=mod(np.xy,vec2(6.,6))-vec2(3.,3.);
        np += tn * .4; //add noise texture to np position to give everything made with np a nice girtty grungey texture but still subtle;
        h = vec2(length(np) - 1.3, 1.0);  //Glow Balls outter bit (the scrotum is believe, lolz) added to white material
        h.x = smax(length(np - vec3(0, 0, 1.3)) - 1.3, h.x, 0.3); //Cut and cup the glow ball outter bit into egg holder
        float gloBalls = length(np - vec3(0, 0, 0.3)) - .8; //Glow Balls
        gloBalls = .7 * smin(gloBalls, length(abs(np.xz - vec2(0, .5)) - vec2(0.2, .0)) - .01, .3); //vertical lazers along glow balls
        g += 0.1 / (0.1 + gloBalls * gloBalls * (40. - 39. * sin(pp.x + tt * 2.))) * ga; //make glow balls + lazers glow
        h.x = min(gloBalls, h.x); //Add glowballs to white blended material  
        np.xy = abs(np.xy) - 1.6; //clone np again to make more vertical lines
        t.x = smin(t.x, 0.65 * (length(np.xz + vec2(0, 0.2)) - .2 + sin(np.y * 30.) * .05), .7);  //vertical ridges / ribs on side of balls added to blue material
        float spikes = .7 * (length(np.xy) - .1); //spikes / branches coming out of centre into outter blue ring
        cp = np;
        cp.x = abs(abs(cp.x) - 2.) - 1.; //we need more balls and spikes
        h.x = smin(h.x, length(cp) - .5, .2); //secondary  ridges
        spikes = smin(spikes, length(cp.xy) - .15, .3);//more spikes
        spikes = max(spikes, abs(np.z) - 2.); //cut spikes to limit them
        h.x = smin(h.x, spikes, .5); //Add spikes to white material  
        np.z -= 2.5; //Shift thing outwards to make a ring (yeah could have used a torus)
        t.x = smin(t.x, length(np.yz) - .1, .3); //outter blue ring added to blue material
        h.x *= 0.6; //Increase definition of geometry to avoid artifact
        t = smin2(t, h, .75);  //BLend both blue and white geometries AND materials, see line below: al=mix(vec3(.1,.2,0.5)-tn*.5,vec3(1.),clamp(z.y,0.,1.));
        h = vec2(tor(p, vec2(10, 2.)), 2); //TECHY SIDE OF RING //BLACK torus
        cp = p;
        cp.y = abs(cp.y); //Make position to cut torus with it by using planes (abs(p.planeaxis)-something)
        cp.xy *= r2(1.);  //rotate cut position to cut at angle (sort of like an X)
        pp = cp;
        pp.y = mod(pp.y, 2.) - 1.;//make modulo of cut pos to clone and cut loads
        h.x = max(h.x, abs(pp.y) - .5); //cut with cut pos and y plane
        h.x = smin(h.x, tor(p, vec2(10, 1.5)), .5); //add another black torus but this time smaller thickness, swith smin makes black tori just one torus with hing groove thing
        h.x = max(h.x, cp.y); //Cut whole right hand side part of black torus
        h.x = max(h.x, -(abs(abs(pp.y) - 1.) - .1));  //Cut bunch more times this time inside each groove
        t = t.x < h.x ? t : h;  //Add black torus to rest of scene
        h = vec2(tor(p, vec2(10, 2.1)), 3);  //WHITE outter torus
        h.x = max(h.x, abs(abs(pp.y) - .2) - .1); //cut white torus with loads of slashes
        pp = p;
        pp.z = abs(pp.z) - 1.5; //make some position for blue lazers
        float glo = min(tor(pp, vec2(11, 0.)), tor(pp, vec2(9, 0.))); //blue lazers made of super thing tori
        glo = max(glo, cp.y);  //cut all lazer tori right hand side of ring
        g += 0.1 / (0.1 + glo * glo * (40. - 39. * sin(rp.x + tt))) * ga; //Add blue lazer tori to glow variable to make it glow
        h.x = min(glo, h.x); //Add glow tori to white outter torus material geom
        h.x = max(h.x, cp.y + .6); //Cut white torus
        glo = length(p - lp) - .7; //Glow light sphere
        glo = .7 * min(glo, max(length(cos(rp * (1. - szer) - vec3(tt * 2., 0, 0))), tor(p, vec2(10, 3.)))); //Particles
        g += 0.5 / (0.1 + glo * glo * 40.) * ga; //blue tori lazers + glow light + particles added to glow variable to make em glow
        h.x = min(glo, h.x); //Adding all above geomtries to white torus geom material
        t = t.x < h.x ? t : h; //Add white geom material to scene
        return t;
    }
    vec2 tr(vec3 ro, vec3 rd) {
        vec2 h, t = vec2(.1); //near plane
        for(int i = 0; i < 128; i++) { //march 128 times max
            h = mp(ro + rd * t.x, 1.); //where we at?
            if(h.x < .0001 || t.x > 40.)
                break; //Break if touching geom
            t.x += h.x;
            t.y = h.y; //jump forward and remember material id
        }
        if(t.x > 40.)
            t.y = -1.; //if too far return -1 mat id
        return t;
    }
    #define a(d) clamp(mp(po+no*d,0.).x/d,0.,1.)
    #define s(d) smoothstep(0.,1.,mp(po+ld*d,0.).x/d)
    vec3 lit(float diffuseAmount, float attenuation, float specularAmount) {
        ld = normalize(lp - po); //light direction
        float dif = diffuseAmount * max(0., dot(no, ld)), //diffuse
        fr = pow(1. + dot(no, ld), 4.), //fesnel background reflections
        sp = pow(max(dot(reflect(-ld, no), -rd), 0.), 40.) * specularAmount, //specular highlights
        attn = 1. - pow(min(1., length(lp - po) / attenuation), 4.0);  //point ligh attenuation
        return attn * mix(sp + al * (a(.2) + .2) * (dif + s(2.) * .5), fo, min(fr, .5)); //return whole lighting with diffuse specular albedo, ao,sss and fresnel
    }
    vec4 doMask(vec3 bg, vec3 fg) {
        float maxrb = max(fg.r, fg.b);
        float k = clamp((fg.g - maxrb) * 5.0, 0.0, 1.0);
        float dg = fg.g;
        fg.g = min(fg.g, maxrb * 0.8);
        fg += dg - fg.g;
        vec4 result = vec4(mix(fg, bg, k), 1.0);
        return result;
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = (fragCoord.xy / iResolution.xy - 0.5) / vec2(iResolution.y / iResolution.x, 1); //get uv
        tt = 20. + mod(iTime, 62.82), spa = 0.; //tt = time, spa= specular amount
        b = smoothstep(0., 1., min(max(cos(tt * .2), 0.), .5) + 1. - (1. - min(max(cos(tt * .2), 0.), .5))); //animation variable for camera
        lp = vec3(cos(tt * .4 - 1.) * (10. - cos(tt * .4 - 1.) * 5.), sin(tt * .4 - 1.) * (10. - cos(tt * .4 - 1.) * 4.), sin(tt * .4 - 1.) * 5.); //point light position
        vec3 ro = mix(vec3(cos(tt * .2) * 15., cos(tt * .2) * 2., sin(tt * .2) * 15.), //first cam angle, spining around ring
        vec3(cos(tt * .4 - 2.11) * (10. - cos(tt * .4 - 2.5) * 4.), sin(tt * .4 - 2.5) * (10. - cos(tt * .4 - 2.5) * 4.), sin(tt * .4 - 2.5) * 6.), b),//second cam angle, following the point light
        cw = normalize(mix(vec3(0), lp - 2., b) - ro), cu = normalize(cross(cw, vec3(0, 1, 0))), cv = normalize(cross(cu, cw)), co; //camera builkding stuff
        rd = mat3(cu, cv, cw) * normalize(vec3(uv, .5)); //ray direction
        co = fo = max(vec3(0.0), vec3(.14, .1, .12) - length(uv) * .12) * (1. - texNoise(rd.xy * .1, iChannel0).r * 4.0) - rd.y * .05; //background colour
        z = tr(ro, rd);
        t = z.x; //trace / raymarch each pixel
        if(z.y > -1.) { //if more than -1 material id then we muist have hit something
            po = ro + rd * t; //Get position where we hit
            no = normalize(e.xyy * mp(po + e.xyy, 0.).x + e.yyx * mp(po + e.yyx, 0.).x + e.yxy * mp(po + e.yxy, 0.).x + e.xxx * mp(po + e.xxx, 0.).x);//get normal of position where we hit        
            al = mix(vec3(.1, .2, 0.5) - tn * .5, vec3(1.), clamp(z.y, 0., 1.)); //albedo colour mixed between blue and white using material id (smin2 function call in mp leads to this), no specular to make it more organic
            if(z.y > 1.)
                al = vec3(0.), spa = 1., no += .5 * floor(abs(sin(cp.xyx * 10.)) - .1), no = normalize(no); //If mat Id is >1 then we do black colour and we add details by tweaking normals to make lines, yes we turn on specular too
            if(z.y > 2.)
                al = vec3(1.), spa = 1.;  //If mat id >2 then we make it white with specular
            co = lit(2., 10., spa); //Do lighting for main point light rotating around ring
            lp = ro;
            co += lit(1. - b * .5, 20., spa);  //Do another point lkight where camera is at
            co = mix(fo, co, exp(-.00004 * t * t * t)); //Add some fog, just a bit...
        }
        vec4 res = vec4(pow(co + g * .2 * mix(vec3(.7, .2, .1), vec3(.1, .2, .7), smoothstep(0., 1., (op.x * .3))), vec3(.45)), 1);//Final colour with glow added at the end, glow with mixed from left to right using global "op" original scene position

        fragColor = doMask(res.xyz,texture(webcam,1. - fragCoord.xy / resolution.xy ).xyz);



    }

    void main() {
        mainImage(fragColor, gl_FragCoord.xy);
    }
`;