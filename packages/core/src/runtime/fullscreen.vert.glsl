// Shared vertex shader for every effect: a fullscreen quad via TRIANGLE_STRIP.
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
