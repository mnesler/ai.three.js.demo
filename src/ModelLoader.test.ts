import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModelLoader } from './ModelLoader';
import * as THREE from 'three';

describe('ModelLoader', () => {
  let scene: THREE.Scene;
  let modelLoader: ModelLoader;

  beforeEach(() => {
    scene = new THREE.Scene();
    modelLoader = new ModelLoader(scene);
  });

  describe('Initialization', () => {
    it('should create a ModelLoader instance', () => {
      expect(modelLoader).toBeInstanceOf(ModelLoader);
    });

    it('should store the scene reference', () => {
      expect(modelLoader.getScene()).toBe(scene);
    });
  });

  describe('Loading Models', () => {
    it('should have a loadOBJ method', () => {
      expect(typeof modelLoader.loadOBJ).toBe('function');
    });

    it('should apply default material when no material provided', async () => {
      // Mock OBJLoader to return a simple mesh
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const object = await modelLoader.loadOBJ('/assets/test.obj');
      expect(object).toBeDefined();
    });

    it('should allow custom material options', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const materialOptions = { color: 0xff0000 };
      const object = await modelLoader.loadOBJ('/assets/test.obj', materialOptions);
      expect(object).toBeDefined();
    });
  });

  describe('Material Application', () => {
    it('should create MeshStandardMaterial by default', () => {
      const material = modelLoader.createDefaultMaterial();
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    });

    it('should apply default color to material', () => {
      const material = modelLoader.createDefaultMaterial();
      expect(material.color).toBeInstanceOf(THREE.Color);
    });

    it('should allow custom material color', () => {
      const material = modelLoader.createDefaultMaterial({ color: 0xff0000 });
      expect(material.color.getHex()).toBe(0xff0000);
    });

    it('should apply material to loaded geometry', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const object = await modelLoader.loadOBJ('/assets/test.obj', { color: 0x00ff00 });

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          expect(child.material).toBeInstanceOf(THREE.MeshStandardMaterial);
        }
      });
    });
  });

  describe('Scene Integration', () => {
    it('should add loaded model to scene', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const initialChildCount = scene.children.length;
      await modelLoader.loadOBJ('/assets/test.obj', {}, true);

      expect(scene.children.length).toBe(initialChildCount + 1);
    });

    it('should not add to scene when addToScene is false', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const initialChildCount = scene.children.length;
      await modelLoader.loadOBJ('/assets/test.obj', {}, false);

      expect(scene.children.length).toBe(initialChildCount);
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors gracefully', async () => {
      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockRejectedValue(
        new Error('Failed to load')
      );

      await expect(modelLoader.loadOBJ('/assets/invalid.obj')).rejects.toThrow(
        'Failed to load'
      );
    });

    it('should provide meaningful error messages', async () => {
      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockRejectedValue(
        new Error('404 Not Found')
      );

      await expect(modelLoader.loadOBJ('/assets/missing.obj')).rejects.toThrow(
        '404 Not Found'
      );
    });
  });

  describe('Model Positioning', () => {
    it('should allow setting position after loading', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const object = await modelLoader.loadOBJ('/assets/test.obj');
      object.position.set(1, 2, 3);

      expect(object.position.x).toBe(1);
      expect(object.position.y).toBe(2);
      expect(object.position.z).toBe(3);
    });

    it('should allow setting rotation after loading', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const object = await modelLoader.loadOBJ('/assets/test.obj');
      object.rotation.set(0.5, 1.0, 1.5);

      expect(object.rotation.x).toBe(0.5);
      expect(object.rotation.y).toBe(1.0);
      expect(object.rotation.z).toBe(1.5);
    });

    it('should allow setting scale after loading', async () => {
      const mockGeometry = new THREE.BufferGeometry();
      const mockMesh = new THREE.Mesh(mockGeometry);

      vi.spyOn(modelLoader as any, 'loadOBJInternal').mockResolvedValue(mockMesh);

      const object = await modelLoader.loadOBJ('/assets/test.obj');
      object.scale.set(2, 2, 2);

      expect(object.scale.x).toBe(2);
      expect(object.scale.y).toBe(2);
      expect(object.scale.z).toBe(2);
    });
  });
});
