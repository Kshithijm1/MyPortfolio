// Shared GLSL noise helpers used across the planet, moon, star, cloud,
// nebula and ring shaders. 2D value noise + fbm for flat surfaces, and
// 3D value noise + fbm for seamless sphere-surface texturing (no UV seam
// or pole-pinch artifacts).
export const NOISE_GLSL = `
float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
    return vnoise(p)        * 0.500
         + vnoise(p * 2.03) * 0.250
         + vnoise(p * 4.11) * 0.125
         + vnoise(p * 8.17) * 0.063;
}

// 3D value noise — seamless on sphere surface (no UV seam / pole pinch artifacts)
float hash31(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yzx + 45.32);
    return fract((p.x + p.y) * p.z);
}
float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash31(i),               hash31(i + vec3(1,0,0)), u.x),
            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), u.x), u.y),
        mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), u.x),
            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), u.x), u.y),
        u.z
    );
}
float fbm3(vec3 p) {
    return vnoise3(p)        * 0.500
         + vnoise3(p * 2.03) * 0.250
         + vnoise3(p * 4.11) * 0.125
         + vnoise3(p * 8.17) * 0.063;
}
`
