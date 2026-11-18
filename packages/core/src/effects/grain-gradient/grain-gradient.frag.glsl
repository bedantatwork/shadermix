// grain-gradient — animated angled gradient with film grain
// Author: Shadermix. License: MIT. Original work — not derived from ShaderToy or React Bits.
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uGrainAmount;
uniform float uAngle;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 gradient3(float t, vec3 c0, vec3 c1, vec3 c2) {
  float t2 = clamp(t, 0.0, 1.0);
  float firstHalf = smoothstep(0.0, 1.0, t2 * 2.0);
  float secondHalf = smoothstep(0.0, 1.0, (t2 - 0.5) * 2.0);
  vec3 low = mix(c0, c1, firstHalf);
  vec3 high = mix(c1, c2, secondHalf);
  return mix(low, high, step(0.5, t2));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 centered = uv - 0.5;

  float rad = radians(uAngle);
  vec2 dir = vec2(cos(rad), sin(rad));
  float t = dot(centered, dir) + 0.5;
  t += sin(uTime * uSpeed * 0.5) * 0.15;

  vec3 color = gradient3(t, uColorA, uColorB, uColorC);

  float grain = (hash(gl_FragCoord.xy + uTime * 97.0) - 0.5) * uGrainAmount;
  color += grain;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
