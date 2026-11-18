import type { GLContext } from "./gl.js";
import fullscreenVert from "./fullscreen.vert.glsl";

function compileShader(gl: GLContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[shadermix] shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface ShaderProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  /** Binds the fullscreen quad's position attribute. Call once after creation. */
  bindQuad(): void;
}

/** Compiles the shared fullscreen vertex shader against `fragmentSource` and binds a unit quad. */
export function createShaderProgram(
  gl: GLContext,
  fragmentSource: string,
  uniformNames: readonly string[],
): ShaderProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, fullscreenVert);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[shadermix] program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const positionLocation = gl.getAttribLocation(program, "aPosition");

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (const name of uniformNames) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  return {
    program,
    uniforms,
    bindQuad() {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    },
  };
}

export function drawFullscreenQuad(gl: GLContext): void {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
