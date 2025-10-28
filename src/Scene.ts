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
  private clock: THREE.Clock;
  private headRotationSpeed: number = 0.005; // Default slow rotation
  private skybox: THREE.Mesh | null = null;
  private skyboxMaterial: THREE.ShaderMaterial | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Create clock for shader animation
    this.clock = new THREE.Clock();

    // Create scene
    this.scene = new THREE.Scene();
    // No background color - skybox will be the background

    // Create camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 8, 20); // Moved further away
    this.camera.lookAt(0, 0, 0);

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
    this.controls.target.set(0, 0, 0); // Always look at center

    // Setup lighting
    this.setupLighting();

    // Create circular boundary
    this.createBoundary();

    // Create skybox
    this.createSkybox();

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
        const currentDistance = this.camera.position.length();
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

    // Update controls target to always look at center
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private createSkybox(): void {
    // Create box geometry for skybox (smaller to see more detail)
    const geometry = new THREE.BoxGeometry(100, 100, 100);

    // Create hexagon pattern shader (from shader-example.txt)
    this.skyboxMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(800, 600) },
        iMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define PI    3.141592653
        #define PI2   6.283185307

        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        varying vec3 vWorldPosition;

        const float N = 3.;
        const float s4 = .577350, s3 = .288683, s2 = .866025;
        const vec2 s = vec2(1.732,1);

        mat2 rot(float g) { return mat2(cos(g), sin(g),-sin(g), cos(g)); }

        float hash21(vec2 p) {
            p.x = mod(p.x,3.*N);
            return fract(sin(dot(p,vec2(26.37,45.93)))*4374.23);
        }

        vec4 hexgrid(vec2 uv) {
            vec2 p1 = floor(uv/vec2(1.732,1))+.5,
                 p2 = floor((uv-vec2(1,.5))/vec2(1.732,1))+.5;
            vec2 h1 = uv- p1*vec2(1.732,1),
                 h2 = uv-(p2+.5)*vec2(1.732,1);
            return dot(h1,h1) < dot(h2,h2) ? vec4(h1,p1) : vec4(h2,p2+.5);
        }

        void draw(float d, float px, vec3 clr, vec3 trm, float tk, float ln, inout vec3 C) {
            float b = abs(d)-tk;
            C = mix(C,C*.25,smoothstep(.1+px,-px,b-.01) );
            C = mix(C,clr,smoothstep(px,-px,b ));
            C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, b+.1 ));
            C = mix(C,trm,smoothstep(px,-px,abs(b)-ln ));
        }

        void main() {
            // Convert 3D position to 2D UV for hexagon pattern
            vec3 dir = normalize(vWorldPosition);
            vec2 F = vec2(atan(dir.x, dir.z), acos(dir.y)) * iResolution.xy * 0.15;

            mat2 r2 = rot( 1.047);
            mat2 r3 = rot(-1.047);

            vec2 R = iResolution;
            float T = iTime;
            vec2 M = iMouse;

            vec2 uv = (2.*F-R.xy)/max(R.x,R.y);

            uv = -vec2(log(length(uv)),atan(uv.y,uv.x))-((2.*M.xy-R.xy)/R.xy);
            uv /= 3.628;
            uv *= N;

            uv.y += T*.05;
            uv.x += T*.15;
            float sc = 3., px = fwidth(uv.x*sc);

            vec4 H = hexgrid(uv.yx*sc);
            vec2 p = H.xy, id = H.zw;

            float hs = hash21(id);

            if(hs<.5) p *= hs < .25 ? r3 : r2;

            vec2 p0 = p - vec2(-s3, .5),
                 p1 = p - vec2( s4,  0),
                 p2 = p - vec2(-s3,-.5);

            vec3 d3 = vec3(length(p0), length(p1), length(p2));
            vec2 pp = vec2(0);

            if(d3.x>d3.y) pp = p1;
            if(d3.y>d3.z) pp = p2;
            if(d3.z>d3.x && d3.y>d3.x) pp = p0;

            float ln = .015;
            float tk = .14+.1*sin(uv.x*5.+T);

            vec3 C = vec3(0);

            // tile background
            float d = max(abs(p.x)*.866025 + abs(p.y)/2., abs(p.y))-(.5-ln);
            C = mix(vec3(.0125),vec3(0.906,0.282,0.075),smoothstep(px,-px,d) );
            C = mix(C,C+.1,mix(smoothstep(px,-px,d+.035),0.,clamp(1.-(H.y+.15),0.,1.)) );
            C = mix(C,C*.1,mix(smoothstep(px,-px,d+.025),0.,clamp(1.-(H.x+.5),0.,1.)) );

            // base tile and empty vars
            float b = length(pp)-s3;
            float t = 1e5, g = 1e5;
            float tg= 1.;

            hs = fract(hs*53.71);

            // alternate tiles
            if(hs>.95) {
                vec2 p4 = p*r3, p5 = p*r2;

                b = length(vec2(p.x,abs(p.y)-.5));
                g = length(p5.x);
                t = length(p4.x);
                tg= 0.;
            }else if(hs>.65) {
                b = length(p.x);
                g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);

                tg= 0.;
            } else if(hs<.15) {
                vec2 p4 = p*r3, p5 = p*r2;

                t = length(p.x);
                b = length(p5.x);
                g = length(p4.x);

                tg= 0.;
            } else if(hs<.22) {
                b = length(vec2(p.x,abs(p.y)-.5));
                g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);
            }

            vec3 clr = vec3(0.420,0.278,0.043);
            vec3 trm = vec3(.0);

            // draw segments
            draw(t,px,clr,trm,tk,ln,C);
            draw(g,px,clr,trm,tk,ln,C);
            draw(b,px,clr,trm,tk,ln,C);

            // solid balls
            if(tg>0.){
                float v = length(p)-.25;
                C = mix(C,C*.25,smoothstep(.1+px,-px,v-.01) );
                C = mix(C,clr,smoothstep(px,-px,v ));
                C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, v+.1 ));
                C = mix(C,trm,smoothstep(px,-px,abs(v)-ln ));
            }

            C = pow(C,vec3(.4545));
            gl_FragColor = vec4(C,1);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.skybox = new THREE.Mesh(geometry, this.skyboxMaterial);
    this.scene.add(this.skybox);
  }

  private createBoundary(): void {
    // Create a circular boundary line
    const segments = 64;
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * this.boundaryRadius,
          0,
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

      // Position and scale the model at center (75% smaller = 0.125 scale)
      this.headModel.position.set(0, 0, 0);
      this.headModel.scale.set(0.125, 0.125, 0.125);

      console.log('Head model loaded successfully');
    } catch (error) {
      console.error('Failed to load head model:', error);
    }
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
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

    // Update shader time for animation
    const elapsedTime = this.clock.getElapsedTime();

    if (this.skyboxMaterial) {
      this.skyboxMaterial.uniforms.iTime.value = elapsedTime;
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
