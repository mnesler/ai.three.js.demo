import { Scene } from './Scene';
import { FPSCounter } from './FPSCounter';

class App {
  private scene: Scene;
  private fpsCounter: FPSCounter;

  constructor() {
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('App container element not found');
    }

    // Initialize scene
    this.scene = new Scene(container);

    // Initialize FPS counter
    this.fpsCounter = new FPSCounter('fps', 'frametime');

    // Start the render loop
    this.start();
  }

  private start(): void {
    const animate = (time: number) => {
      requestAnimationFrame(animate);

      // Update FPS counter
      this.fpsCounter.update(time);

      // Render the scene
      this.scene.render();
    };

    // Kick off the animation loop
    requestAnimationFrame(animate);
  }

  public dispose(): void {
    this.scene.dispose();
    this.fpsCounter.dispose();
  }
}

// Initialize the application
const app = new App();

// Handle cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.dispose();
});

// Export for potential testing or external access
export { App };
