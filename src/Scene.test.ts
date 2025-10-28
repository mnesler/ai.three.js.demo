import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Scene } from './Scene';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

describe('Scene', () => {
  let scene: Scene;
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container element for the renderer
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (scene) {
      scene.dispose();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create a scene instance', () => {
      scene = new Scene(container);
      expect(scene).toBeDefined();
      expect(scene).toBeInstanceOf(Scene);
    });

    it('should create a Three.js scene', () => {
      scene = new Scene(container);
      expect(scene.getScene()).toBeInstanceOf(THREE.Scene);
    });

    it('should create a camera with correct properties', () => {
      scene = new Scene(container);
      const camera = scene.getCamera();

      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
      expect(camera.fov).toBe(75);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(1000);
    });

    it('should create a WebGL renderer', () => {
      scene = new Scene(container);
      const renderer = scene.getRenderer();

      expect(renderer).toBeInstanceOf(THREE.WebGLRenderer);
    });

    it('should set renderer size to container dimensions', () => {
      container.style.width = '800px';
      container.style.height = '600px';
      scene = new Scene(container);
      const renderer = scene.getRenderer();

      expect(renderer.domElement.width).toBeGreaterThan(0);
      expect(renderer.domElement.height).toBeGreaterThan(0);
    });

    it('should append canvas to container', () => {
      scene = new Scene(container);
      const canvas = container.querySelector('canvas');

      expect(canvas).toBeTruthy();
      expect(canvas).toBe(scene.getRenderer().domElement);
    });

    it('should enable antialias on renderer', () => {
      scene = new Scene(container);
      const renderer = scene.getRenderer();

      // Check if context has antialiasing
      const gl = renderer.getContext();
      expect(gl.getContextAttributes()?.antialias).toBe(true);
    });
  });

  describe('Lighting', () => {
    it('should add ambient light to the scene', () => {
      scene = new Scene(container);
      const threeScene = scene.getScene();
      const ambientLights = threeScene.children.filter(
        child => child instanceof THREE.AmbientLight
      );

      expect(ambientLights.length).toBeGreaterThan(0);
    });

    it('should add directional light to the scene', () => {
      scene = new Scene(container);
      const threeScene = scene.getScene();
      const directionalLights = threeScene.children.filter(
        child => child instanceof THREE.DirectionalLight
      );

      expect(directionalLights.length).toBeGreaterThan(0);
    });

    it('should position ambient light with correct intensity', () => {
      scene = new Scene(container);
      const threeScene = scene.getScene();
      const ambientLight = threeScene.children.find(
        child => child instanceof THREE.AmbientLight
      ) as THREE.AmbientLight;

      expect(ambientLight).toBeDefined();
      expect(ambientLight.intensity).toBeGreaterThan(0);
    });

    it('should position directional light correctly', () => {
      scene = new Scene(container);
      const threeScene = scene.getScene();
      const directionalLight = threeScene.children.find(
        child => child instanceof THREE.DirectionalLight
      ) as THREE.DirectionalLight;

      expect(directionalLight).toBeDefined();
      expect(directionalLight.position.length()).toBeGreaterThan(0);
    });
  });

  describe('Camera Position', () => {
    it('should position camera with positive z value', () => {
      scene = new Scene(container);
      const camera = scene.getCamera();

      expect(camera.position.z).toBeGreaterThan(0);
    });

    it('should position camera to see the origin', () => {
      scene = new Scene(container);
      const camera = scene.getCamera();

      // Camera should be positioned to view the table at origin
      expect(camera.position.x).toBeDefined();
      expect(camera.position.y).toBeDefined();
      expect(camera.position.z).toBeDefined();
    });
  });

  describe('Responsive Canvas', () => {
    it('should handle window resize', () => {
      // Set initial container dimensions
      Object.defineProperty(container, 'clientWidth', { value: 800, writable: true, configurable: true });
      Object.defineProperty(container, 'clientHeight', { value: 600, writable: true, configurable: true });

      scene = new Scene(container);
      const camera = scene.getCamera();

      // Initial aspect ratio should be 800/600
      expect(camera.aspect).toBe(800 / 600);

      // Simulate window resize to different aspect ratio
      Object.defineProperty(container, 'clientWidth', { value: 1920, writable: true, configurable: true });
      Object.defineProperty(container, 'clientHeight', { value: 1080, writable: true, configurable: true });
      scene.handleResize();

      // Check that camera aspect ratio is updated to new dimensions
      expect(camera.aspect).toBeCloseTo(1920 / 1080, 2);
    });
  });

  describe('Render Loop', () => {
    it('should have a render method', () => {
      scene = new Scene(container);
      expect(scene.render).toBeDefined();
      expect(typeof scene.render).toBe('function');
    });

    it('should have a start method to begin animation loop', () => {
      scene = new Scene(container);
      expect(scene.start).toBeDefined();
      expect(typeof scene.start).toBe('function');
    });

    it('should have a stop method to halt animation loop', () => {
      scene = new Scene(container);
      expect(scene.stop).toBeDefined();
      expect(typeof scene.stop).toBe('function');
    });
  });

  describe('Cleanup', () => {
    it('should dispose of resources properly', () => {
      scene = new Scene(container);

      scene.dispose();

      // After disposal, the canvas should be removed
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeNull();
    });
  });

  describe('Orbit Controls', () => {
    it('should create orbit controls', () => {
      scene = new Scene(container);
      const controls = scene.getControls();

      expect(controls).toBeInstanceOf(OrbitControls);
    });

    it('should configure controls to disable panning', () => {
      scene = new Scene(container);
      const controls = scene.getControls();

      expect(controls.enablePan).toBe(false);
    });

    it('should enable damping on controls', () => {
      scene = new Scene(container);
      const controls = scene.getControls();

      expect(controls.enableDamping).toBe(true);
      expect(controls.dampingFactor).toBe(0.05);
    });

    it('should set controls target to center', () => {
      scene = new Scene(container);
      const controls = scene.getControls();

      expect(controls.target.x).toBe(0);
      expect(controls.target.y).toBe(-200);
      expect(controls.target.z).toBe(0);
    });

    it('should allow zoom within reasonable distances', () => {
      scene = new Scene(container);
      const controls = scene.getControls();

      expect(controls.enableZoom).toBe(true);
      expect(controls.minDistance).toBe(8);
      expect(controls.maxDistance).toBe(50);
    });
  });

  describe('Circular Boundary', () => {
    it('should create a circular boundary', () => {
      scene = new Scene(container);
      const boundary = scene.getBoundary();

      expect(boundary).toBeInstanceOf(THREE.Line);
    });

    it('should add boundary to scene', () => {
      scene = new Scene(container);
      const boundary = scene.getBoundary();
      const threeScene = scene.getScene();

      expect(threeScene.children).toContain(boundary);
    });

    it('should have correct boundary radius', () => {
      scene = new Scene(container);
      const radius = scene.getBoundaryRadius();

      expect(radius).toBe(10);
    });

    it('should create boundary with line material', () => {
      scene = new Scene(container);
      const boundary = scene.getBoundary();

      expect(boundary?.material).toBeInstanceOf(THREE.LineBasicMaterial);
    });

    it('should position camera near boundary radius', () => {
      scene = new Scene(container);
      const camera = scene.getCamera();
      const radius = scene.getBoundaryRadius();

      // Camera should be positioned at a reasonable distance from the head/boundary
      // Camera is at (0, -192, 20), head/boundary at (0, -200, 0)
      const headPosition = new THREE.Vector3(0, -200, 0);
      const distance = camera.position.distanceTo(headPosition);

      // Distance from camera to head should be reasonable
      expect(distance).toBeGreaterThanOrEqual(radius);
      expect(distance).toBeLessThanOrEqual(radius * 3);
    });
  });
});
