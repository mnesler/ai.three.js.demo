export class FPSCounter {
  private fpsElement: HTMLElement;
  private frameTimeElement: HTMLElement;
  private lastTime: number = 0;
  private frames: number = 0;
  private currentFPS: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS display every 1 second
  private lastFPSUpdate: number = 0;
  private frameTimes: number[] = [];
  private maxFrameSamples: number = 60; // Keep last 60 frame times for smoothing

  constructor(fpsElementId: string, frameTimeElementId: string) {
    const fpsEl = document.getElementById(fpsElementId);
    const frameTimeEl = document.getElementById(frameTimeElementId);

    if (!fpsEl) {
      throw new Error(`FPS element with id "${fpsElementId}" not found`);
    }

    if (!frameTimeEl) {
      throw new Error(`Frame time element with id "${frameTimeElementId}" not found`);
    }

    this.fpsElement = fpsEl;
    this.frameTimeElement = frameTimeEl;
  }

  public update(currentTime: number): void {
    // Calculate frame time
    if (this.lastTime > 0) {
      const deltaTime = currentTime - this.lastTime;
      this.frameTimes.push(deltaTime);

      // Keep only the last N samples
      if (this.frameTimes.length > this.maxFrameSamples) {
        this.frameTimes.shift();
      }

      this.frames++;

      // Calculate FPS immediately from frame times
      if (this.frameTimes.length > 0) {
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.currentFPS = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
      }
    }

    // Update DOM every interval
    if (currentTime - this.lastFPSUpdate >= this.fpsUpdateInterval) {
      if (this.frameTimes.length > 0) {
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

        // Update DOM
        this.fpsElement.textContent = this.currentFPS.toString();
        this.frameTimeElement.textContent = avgFrameTime.toFixed(2);

        // Reset for next interval
        this.frames = 0;
        this.lastFPSUpdate = currentTime;
      }
    }

    this.lastTime = currentTime;
  }

  public getCurrentFPS(): number {
    return this.currentFPS;
  }

  public getCurrentFrameTime(): number {
    if (this.frameTimes.length === 0) {
      return 0;
    }
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  public getFPSElement(): HTMLElement {
    return this.fpsElement;
  }

  public getFrameTimeElement(): HTMLElement {
    return this.frameTimeElement;
  }

  public dispose(): void {
    this.lastTime = 0;
    this.frames = 0;
    this.currentFPS = 0;
    this.frameTimes = [];
    this.fpsElement.textContent = '0';
    this.frameTimeElement.textContent = '0';
  }
}
