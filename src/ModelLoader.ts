import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export interface MaterialOptions {
  color?: number;
  metalness?: number;
  roughness?: number;
}

export class ModelLoader {
  private scene: THREE.Scene;
  private objLoader: OBJLoader;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.objLoader = new OBJLoader();
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public createDefaultMaterial(options: MaterialOptions = {}): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: options.color ?? 0xcccccc,
      metalness: options.metalness ?? 0.3,
      roughness: options.roughness ?? 0.7,
    });
  }

  public async loadOBJ(
    path: string,
    materialOptions: MaterialOptions = {},
    addToScene: boolean = true
  ): Promise<THREE.Group> {
    try {
      const object = await this.loadOBJInternal(path);

      // Apply material to all meshes in the loaded object
      const material = this.createDefaultMaterial(materialOptions);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      if (addToScene) {
        this.scene.add(object);
      }

      return object;
    } catch (error) {
      throw error;
    }
  }

  private loadOBJInternal(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        path,
        (object) => {
          resolve(object);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }
}
