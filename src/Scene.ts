import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelLoader } from './ModelLoader';

export class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationId: number | null = null;
  private modelLoader: ModelLoader;
  private headModel: THREE.Group | null = null;
  private controls: OrbitControls;
  private boundary: THREE.Line | null = null;
  private boundaryRadius: number = 10;
  private keys: { [key: string]: boolean } = {};
  private moveSpeed: number = 0.1;
  private rotateSpeed: number = 0.02;
  private headRotationSpeed: number = 0.005; // Default slow rotation
  private skybox: THREE.LineSegments | null = null;
  private floorPlane: THREE.Mesh | null = null;
  private floorMaterial: THREE.ShaderMaterial | null = null;
  private clock: THREE.Clock;

  constructor(container: HTMLElement) {
    this.container = container;

    // Create clock for shader animation
    this.clock = new THREE.Clock();

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Black background

    // Create camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, -192, 20); // Positioned to look at head near bottom
    this.camera.lookAt(0, -200, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Setup orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false; // Disable panning
    this.controls.enableZoom = true; // Enable mouse wheel zoom
    this.controls.minDistance = 8; // Minimum zoom distance
    this.controls.maxDistance = 50; // Maximum zoom distance (more space to zoom out)
    this.controls.target.set(0, -200, 0); // Always look at head position near bottom

    // Setup lighting
    this.setupLighting();

    // Create circular boundary
    this.createBoundary();

    // Create skybox
    this.createSkybox();

    // Create floor with shader
    this.createFloor();

    // Initialize model loader
    this.modelLoader = new ModelLoader(this.scene);

    // Load the head model
    this.loadHeadModel();

    // Setup keyboard controls
    this.setupKeyboardControls();

    // Setup rotation speed control
    this.setupRotationControl();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private setupRotationControl(): void {
    const slider = document.getElementById('rotation-slider') as HTMLInputElement;
    const speedValue = document.getElementById('speed-value');

    if (slider && speedValue) {
      slider.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        speedValue.textContent = value.toString();

        // Map slider value (0-100) to rotation speed (0 to 0.05)
        this.headRotationSpeed = (value / 100) * 0.05;
      });
    }

    // Setup camera zoom control
    const cameraSlider = document.getElementById('camera-slider') as HTMLInputElement;
    const cameraValue = document.getElementById('camera-value');

    if (cameraSlider && cameraValue) {
      cameraSlider.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        cameraValue.textContent = value.toString();

        // Set camera distance from origin
        const direction = this.camera.position.clone().normalize();
        this.camera.position.copy(direction.multiplyScalar(value));
      });
    }
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private handleKeyboardMovement(): void {
    const camera = this.camera;

    // Get camera's forward vector
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();

    // W/S - move forward/backward along current direction
    if (this.keys['w']) {
      camera.position.addScaledVector(forward, this.moveSpeed);
    }
    if (this.keys['s']) {
      camera.position.addScaledVector(forward, -this.moveSpeed);
    }

    // A/D - rotate around the circle (orbit left/right)
    if (this.keys['a']) {
      const angle = this.rotateSpeed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
    }
    if (this.keys['d']) {
      const angle = -this.rotateSpeed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
    }

    // Arrow keys for rotation (same as A/D)
    if (this.keys['arrowleft']) {
      const angle = this.rotateSpeed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
    }
    if (this.keys['arrowright']) {
      const angle = -this.rotateSpeed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
    }

    // Update controls target to always look at head position
    this.controls.target.set(0, -200, 0);
    this.controls.update();
  }

  private createSkybox(): void {
    // Create wireframe box with blue edges (5x bigger = 500x500x500)
    const geometry = new THREE.BoxGeometry(500, 500, 500);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x4a90e2, // Blue color
      linewidth: 1
    });

    this.skybox = new THREE.LineSegments(edges, material);
    this.scene.add(this.skybox);
  }

  private createFloor(): void {
    // Create a large plane at the bottom of the skybox
    const geometry = new THREE.PlaneGeometry(500, 500, 1, 1);

    // Convert hexshader.txt Shadertoy shader to Three.js
    this.floorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(800, 600) },
        iMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define R3 1.732051

        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        varying vec2 vUv;

        vec4 HexCoords(vec2 uv) {
            vec2 s = vec2(1, R3);
            vec2 h = .5*s;

            vec2 gv = s*uv;

            vec2 a = mod(gv, s)-h;
            vec2 b = mod(gv+h, s)-h;

            vec2 ab = dot(a,a)<dot(b,b) ? a : b;
            vec2 st = ab;
            vec2 id = gv-ab;

            st = ab;
            return vec4(st, id);
        }

        float GetSize(vec2 id, float seed) {
            float d = length(id);
            float t = iTime*.5;
            float a = sin(d*seed+t)+sin(d*seed*seed*10.+t*2.);
            return a/2. +.5;
        }

        mat2 Rot(float a) {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }

        float Hexagon(vec2 uv, float r, vec2 offs) {
            uv *= Rot(mix(0., 3.1415, r));

            r /= 1./sqrt(2.);
            uv = vec2(-uv.y, uv.x);
            uv.x *= R3;
            uv = abs(uv);

            vec2 n = normalize(vec2(1,1));
            float d = dot(uv, n)-r;
            d = max(d, uv.y-r*.707);

            d = smoothstep(.06, .02, abs(d));

            d += smoothstep(.1, .09, abs(r-.5))*sin(iTime);
            return d;
        }

        float Xor(float a, float b) {
            return a+b;
        }

        float Layer(vec2 uv, float s) {
            vec4 hu = HexCoords(uv*2.);

            float d = Hexagon(hu.xy, GetSize(hu.zw, s), vec2(0));
            vec2 offs = vec2(1,0);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));
            offs = vec2(.5,.8725);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));
            offs = vec2(-.5,.8725);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));

            return d;
        }

        float N(float p) {
            return fract(sin(p*123.34)*345.456);
        }

        vec3 Col(float p, float offs) {
            float n = N(p)*1234.34;
            return sin(n*vec3(12.23,45.23,56.2)+offs*3.)*.5+.5;
        }

        void main() {
            vec2 fragCoord = vUv * iResolution;
            vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
            vec2 UV = fragCoord.xy/iResolution.xy-.5;
            float duv= dot(UV, UV);

            float t = iTime*.2+5.;

            vec3 col = vec3(0);

            // Simplified for floor - use UV coordinates directly
            uv = vUv * 10.0 - 5.0; // Scale UV to cover plane

            uv *= mix(1., 5., sin(t*.5)*.5+.5);
            uv *= Rot(t);
            uv.x *= R3;

            for(float i=0.; i<1.; i+=1./3.) {
                float id = floor(i+t);
                float tt = fract(i+t);
                float z = mix(5., .1, tt);
                float fade = smoothstep(0., .3, tt)*smoothstep(1., .7, tt);

                col += fade*tt*Layer(uv*z, N(i+id))*Col(id,duv);
            }
            col *= 2.;

            col *= 1.-duv*2.;
            gl_FragColor = vec4(col,1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    this.floorPlane = new THREE.Mesh(geometry, this.floorMaterial);
    this.floorPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.floorPlane.position.y = -250; // Position at bottom of skybox
    this.scene.add(this.floorPlane);
  }

  private createBoundary(): void {
    // Create a circular boundary line near the bottom of the skybox
    const segments = 64;
    const points = [];
    const yPosition = -200; // Near bottom of 500-unit skybox (bottom is -250)

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * this.boundaryRadius,
          yPosition,
          Math.sin(theta) * this.boundaryRadius
        )
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x4a90e2,
      linewidth: 2,
    });

    this.boundary = new THREE.Line(geometry, material);
    this.scene.add(this.boundary);
  }

  private async loadHeadModel(): Promise<void> {
    try {
      this.headModel = await this.modelLoader.loadOBJ(
        '/assets/head.OBJ',
        { color: 0xffa07a, roughness: 0.6, metalness: 0.2 }, // Light salmon color
        true // Add to scene
      );

      // Position and scale the model near bottom of skybox (75% smaller = 0.125 scale)
      this.headModel.position.set(0, -200, 0);
      this.headModel.scale.set(0.125, 0.125, 0.125);

      console.log('Head model loaded successfully');
    } catch (error) {
      console.error('Failed to load head model:', error);
    }
  }

  private setupLighting(): void {
    // Soft blue ambient light
    const ambientLight = new THREE.AmbientLight(0x4a90e2, 0.5);
    this.scene.add(ambientLight);

    // Soft blue directional light from above
    const directionalLight = new THREE.DirectionalLight(0x6ab0f2, 0.6);
    directionalLight.position.set(0, 50, 0);
    this.scene.add(directionalLight);
  }

  public handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public render(): void {
    // Handle keyboard movement
    this.handleKeyboardMovement();

    // Update orbit controls
    this.controls.update();

    // Update shader time for floor animation
    const elapsedTime = this.clock.getElapsedTime();
    if (this.floorMaterial) {
      this.floorMaterial.uniforms.iTime.value = elapsedTime;
    }

    // Rotate the head on Y-axis based on rotation speed
    if (this.headModel) {
      this.headModel.rotation.y += this.headRotationSpeed;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public start(): void {
    if (this.animationId !== null) {
      return; // Already running
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.render();
    };

    animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public dispose(): void {
    this.stop();

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));

    // Dispose of controls
    this.controls.dispose();

    // Dispose of renderer
    this.renderer.dispose();

    // Remove canvas from DOM
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }

    // Clean up scene objects
    this.scene.clear();
  }

  // Getters for testing
  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public getBoundary(): THREE.Line | null {
    return this.boundary;
  }

  public getBoundaryRadius(): number {
    return this.boundaryRadius;
  }
}
