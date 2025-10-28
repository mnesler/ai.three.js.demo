// WebGL mock setup for testing Three.js

// Mock WebGL context for Three.js tests
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  getParameter() { return ''; }
  getExtension() { return null; }
  createProgram() { return {}; }
  createShader() { return {}; }
  shaderSource() {}
  compileShader() {}
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return true; }
  getShaderParameter() { return true; }
  useProgram() {}
  getUniformLocation() { return null; }
  getAttribLocation() { return 0; }
  enableVertexAttribArray() {}
  vertexAttribPointer() {}
  uniformMatrix4fv() {}
  uniform1f() {}
  uniform1i() {}
  uniform3fv() {}
  uniform4fv() {}
  createBuffer() { return {}; }
  bindBuffer() {}
  bufferData() {}
  createTexture() { return {}; }
  bindTexture() {}
  texImage2D() {}
  texParameteri() {}
  generateMipmap() {}
  activeTexture() {}
  clear() {}
  clearColor() {}
  clearDepth() {}
  clearStencil() {}
  enable() {}
  disable() {}
  depthFunc() {}
  blendFunc() {}
  viewport() {}
  drawArrays() {}
  drawElements() {}
  deleteBuffer() {}
  deleteTexture() {}
  deleteProgram() {}
  deleteShader() {}
  getContextAttributes() {
    return {
      alpha: true,
      antialias: true,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
      desynchronized: false,
    };
  }
  getShaderPrecisionFormat() {
    return {
      precision: 23,
      rangeMin: 127,
      rangeMax: 127,
    };
  }
  scissor() {}
  stencilFunc() {}
  stencilOp() {}
  stencilMask() {}
  colorMask() {}
  depthMask() {}
  lineWidth() {}
  polygonOffset() {}
  frontFace() {}
  cullFace() {}
  pixelStorei() {}
  readPixels() {}
  finish() {}
  flush() {}
  createFramebuffer() { return {}; }
  bindFramebuffer() {}
  framebufferTexture2D() {}
  checkFramebufferStatus() { return 36053; } // FRAMEBUFFER_COMPLETE
  createRenderbuffer() { return {}; }
  bindRenderbuffer() {}
  renderbufferStorage() {}
  framebufferRenderbuffer() {}
  deleteFramebuffer() {}
  deleteRenderbuffer() {}
  blendEquation() {}
  blendEquationSeparate() {}
  blendFuncSeparate() {}
  isContextLost() { return false; }
  texImage3D() {}
  texSubImage3D() {}
  compressedTexImage3D() {}
  compressedTexSubImage3D() {}
  copyTexSubImage3D() {}
  texStorage2D() {}
  texStorage3D() {}
  getSupportedExtensions() { return []; }
  drawBuffers() {}
  clearBufferfv() {}
  clearBufferiv() {}
  clearBufferuiv() {}
  clearBufferfi() {}
  getUniformBlockIndex() { return 0; }
  uniformBlockBinding() {}
  createVertexArray() { return {}; }
  bindVertexArray() {}
  deleteVertexArray() {}
  isVertexArray() { return false; }
  createQuery() { return {}; }
  deleteQuery() {}
  beginQuery() {}
  endQuery() {}
  getQuery() { return null; }
  getQueryParameter() { return null; }
  createSampler() { return {}; }
  deleteSampler() {}
  bindSampler() {}
  samplerParameteri() {}
  samplerParameterf() {}
  getSamplerParameter() { return null; }
  fenceSync() { return {}; }
  isSync() { return false; }
  deleteSync() {}
  clientWaitSync() { return 0; }
  waitSync() {}
  getSyncParameter() { return null; }
  createTransformFeedback() { return {}; }
  deleteTransformFeedback() {}
  bindTransformFeedback() {}
  beginTransformFeedback() {}
  endTransformFeedback() {}
  transformFeedbackVaryings() {}
  getTransformFeedbackVarying() { return null; }
  pauseTransformFeedback() {}
  resumeTransformFeedback() {}
  getIndexedParameter() { return null; }
  getActiveUniforms() { return null; }
  getActiveUniformBlockParameter() { return null; }
  getActiveUniformBlockName() { return ''; }
  uniformMatrix2x3fv() {}
  uniformMatrix3x2fv() {}
  uniformMatrix2x4fv() {}
  uniformMatrix4x2fv() {}
  uniformMatrix3x4fv() {}
  uniformMatrix4x3fv() {}
  vertexAttribI4i() {}
  vertexAttribI4iv() {}
  vertexAttribI4ui() {}
  vertexAttribI4uiv() {}
  vertexAttribIPointer() {}
  vertexAttribDivisor() {}
  drawArraysInstanced() {}
  drawElementsInstanced() {}
  drawRangeElements() {}
  invalidateFramebuffer() {}
  invalidateSubFramebuffer() {}
  readBuffer() {}
  getInternalformatParameter() { return null; }
  renderbufferStorageMultisample() {}
  blitFramebuffer() {}
}

// Mock canvas.getContext for WebGL
const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function(contextType: string, options?: any) {
  if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
    return new MockWebGLRenderingContext(this) as any;
  }
  return originalGetContext.call(this, contextType, options);
};

// Mock canvas width and height
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  get() { return this._width || 300; },
  set(value) { this._width = value; },
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  get() { return this._height || 150; },
  set(value) { this._height = value; },
});

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  (globalThis as any).performance = {
    now: () => Date.now(),
  };
}

// Mock requestAnimationFrame
if (typeof requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as any;
  };
}

// Mock cancelAnimationFrame
if (typeof cancelAnimationFrame === 'undefined') {
  (globalThis as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}
