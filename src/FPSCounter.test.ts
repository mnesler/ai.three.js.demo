import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FPSCounter } from './FPSCounter';

describe('FPSCounter', () => {
  let fpsCounter: FPSCounter;
  let fpsElement: HTMLSpanElement;
  let frameTimeElement: HTMLSpanElement;

  beforeEach(() => {
    // Create DOM elements
    fpsElement = document.createElement('span');
    fpsElement.id = 'fps';
    frameTimeElement = document.createElement('span');
    frameTimeElement.id = 'frametime';

    document.body.appendChild(fpsElement);
    document.body.appendChild(frameTimeElement);
  });

  afterEach(() => {
    if (fpsCounter) {
      fpsCounter.dispose();
    }
    document.body.removeChild(fpsElement);
    document.body.removeChild(frameTimeElement);
  });

  describe('Initialization', () => {
    it('should create an FPSCounter instance', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter).toBeDefined();
      expect(fpsCounter).toBeInstanceOf(FPSCounter);
    });

    it('should find and store reference to FPS element', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter.getFPSElement()).toBe(fpsElement);
    });

    it('should find and store reference to frame time element', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter.getFrameTimeElement()).toBe(frameTimeElement);
    });

    it('should throw error if FPS element is not found', () => {
      document.body.removeChild(fpsElement);
      expect(() => new FPSCounter('fps', 'frametime')).toThrow();
      // Re-add for cleanup
      document.body.appendChild(fpsElement);
    });

    it('should throw error if frame time element is not found', () => {
      document.body.removeChild(frameTimeElement);
      expect(() => new FPSCounter('fps', 'frametime')).toThrow();
      // Re-add for cleanup
      document.body.appendChild(frameTimeElement);
    });
  });

  describe('FPS Calculation', () => {
    it('should initialize FPS to 0', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter.getCurrentFPS()).toBe(0);
    });

    it('should update FPS on update call', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      const now = performance.now();

      fpsCounter.update(now);

      // FPS should still be 0 on first call
      expect(fpsCounter.getCurrentFPS()).toBe(0);

      // Second call should calculate FPS
      fpsCounter.update(now + 16.67); // ~60 FPS frame time
      expect(fpsCounter.getCurrentFPS()).toBeGreaterThan(0);
    });

    it('should calculate approximately 60 FPS with 16.67ms frame time', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      // Simulate several frames at 60 FPS
      for (let i = 0; i < 10; i++) {
        fpsCounter.update(time);
        time += 16.67; // 60 FPS = ~16.67ms per frame
      }

      const fps = fpsCounter.getCurrentFPS();
      expect(fps).toBeGreaterThan(55);
      expect(fps).toBeLessThan(65);
    });

    it('should calculate approximately 30 FPS with 33.33ms frame time', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      // Simulate several frames at 30 FPS
      for (let i = 0; i < 10; i++) {
        fpsCounter.update(time);
        time += 33.33; // 30 FPS = ~33.33ms per frame
      }

      const fps = fpsCounter.getCurrentFPS();
      expect(fps).toBeGreaterThan(28);
      expect(fps).toBeLessThan(32);
    });
  });

  describe('Frame Time Calculation', () => {
    it('should initialize frame time to 0', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter.getCurrentFrameTime()).toBe(0);
    });

    it('should calculate frame time correctly', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      const startTime = 1000;
      const endTime = 1016.67;

      fpsCounter.update(startTime);
      fpsCounter.update(endTime);

      const frameTime = fpsCounter.getCurrentFrameTime();
      expect(frameTime).toBeCloseTo(16.67, 0);
    });
  });

  describe('DOM Updates', () => {
    it('should update FPS element text content after interval', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      // Simulate frames over 1 second to trigger DOM update
      for (let i = 0; i < 60; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      // Trigger DOM update by passing the interval threshold
      fpsCounter.update(time + 1000);

      const fpsText = fpsElement.textContent;
      expect(fpsText).not.toBe('0');
      expect(fpsText).toBeTruthy();
    });

    it('should update frame time element text content after interval', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      // Simulate frames over 1 second to trigger DOM update
      for (let i = 0; i < 60; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      // Trigger DOM update by passing the interval threshold
      fpsCounter.update(time + 1000);

      const frameTimeText = frameTimeElement.textContent;
      expect(frameTimeText).not.toBe('0');
      expect(frameTimeText).toBeTruthy();
    });

    it('should format FPS as integer', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      for (let i = 0; i < 60; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      // Trigger DOM update
      fpsCounter.update(time + 1000);

      const fpsText = fpsElement.textContent || '';
      // Should be a number without decimal places
      expect(/^\d+$/.test(fpsText)).toBe(true);
    });

    it('should format frame time with decimal precision', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      for (let i = 0; i < 60; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      // Trigger DOM update
      fpsCounter.update(time + 1000);

      const frameTimeText = frameTimeElement.textContent || '';
      // Should be a number with decimals
      expect(/^\d+\.?\d*$/.test(frameTimeText)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle rapid updates efficiently', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      const startMeasure = performance.now();

      // Simulate 1000 frame updates
      for (let i = 0; i < 1000; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      const endMeasure = performance.now();
      const measureTime = endMeasure - startMeasure;

      // 1000 updates should complete in reasonable time (< 100ms)
      expect(measureTime).toBeLessThan(100);
    });
  });

  describe('Cleanup', () => {
    it('should have a dispose method', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      expect(fpsCounter.dispose).toBeDefined();
      expect(typeof fpsCounter.dispose).toBe('function');
    });

    it('should reset values after dispose', () => {
      fpsCounter = new FPSCounter('fps', 'frametime');
      let time = 0;

      // Generate some FPS data
      for (let i = 0; i < 5; i++) {
        fpsCounter.update(time);
        time += 16.67;
      }

      fpsCounter.dispose();

      expect(fpsCounter.getCurrentFPS()).toBe(0);
      expect(fpsCounter.getCurrentFrameTime()).toBe(0);
    });
  });
});
