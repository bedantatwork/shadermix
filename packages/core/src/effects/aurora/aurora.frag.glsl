// aurora — soft flowing northern-lights bands
// Author: Shadermix. License: MIT. Original work — not derived from ShaderToy or React Bits.
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uBlend;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float band(vec2 uv, float t, float offset, float freq) {
  float warp = noise(vec2(uv.x * freq + t * 0.6, offset * 3.1)) * 0.6;
  float wave = sin(uv.x * freq * 3.14159 + t + offset * 2.0) * 0.5 + warp;
  float center = 0.5 + offset * 0.18 + wave * 0.18 * uAmplitude;
  float width = 0.16 + 0.05 * uAmplitude;
  float inner = width * (1.0 - clamp(uBlend, 0.0, 0.9));
  float dist = abs(uv.y - center);
  return 1.0 - smoothstep(inner, width, dist);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv.x *= uResolution.x / uResolution.y;

  float t = uTime * uSpeed;

  float a = band(uv, t, -1.0, 2.2);
  float b = band(uv, t, 0.0, 2.6);
  float c = band(uv, t, 1.0, 3.0);

  vec3 color = uColorA * a + uColorB * b + uColorC * c;
  float glow = a + b + c;
  color += (uColorA + uColorB + uColorC) / 3.0 * glow * 0.15;

  float alpha = clamp(glow, 0.0, 1.0);
  // The GL context uses premultipliedAlpha: true — premultiply before output.
  gl_FragColor = vec4(color * alpha, alpha);
}
