// mesh-gradient — slowly morphing multi-point colour mesh (Stripe-like)
// Author: Shadermix. License: MIT. Original work — not derived from ShaderToy or React Bits.
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uSpeed;
uniform float uDistortion;
uniform float uGrain;

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

vec2 pointPos(vec2 center, float t, float freq, float phase, float radius) {
  return center + radius * vec2(cos(t * freq + phase), sin(t * freq * 0.8 + phase));
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv.x *= aspect;
  vec2 center = vec2(aspect * 0.5, 0.5);

  float t = uTime * uSpeed;

  vec2 warp = vec2(noise(uv * 2.0 + t * 0.1), noise(uv * 2.0 + 10.0 + t * 0.1)) - 0.5;
  vec2 wuv = uv + warp * uDistortion * 0.4;

  vec2 p0 = pointPos(center, t, 0.6, 0.0, 0.42);
  vec2 p1 = pointPos(center, t, 0.5, 2.1, 0.46);
  vec2 p2 = pointPos(center, t, 0.7, 4.2, 0.40);
  vec2 p3 = pointPos(center, t, 0.45, 1.3, 0.44);

  float d0 = dot(wuv - p0, wuv - p0) + 0.02;
  float d1 = dot(wuv - p1, wuv - p1) + 0.02;
  float d2 = dot(wuv - p2, wuv - p2) + 0.02;
  float d3 = dot(wuv - p3, wuv - p3) + 0.02;

  float w0 = 1.0 / d0;
  float w1 = 1.0 / d1;
  float w2 = 1.0 / d2;
  float w3 = 1.0 / d3;
  float sum = w0 + w1 + w2 + w3;

  vec3 color = (uColorA * w0 + uColorB * w1 + uColorC * w2 + uColorD * w3) / sum;

  float grain = (hash(gl_FragCoord.xy + uTime * 60.0) - 0.5) * uGrain;
  color += grain;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
