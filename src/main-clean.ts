import { ApplicationController } from './application-controller';

// Clean Main Entry Point - Following Single Responsibility Principle
// Only responsible for application bootstrap
class Main {
  private readonly applicationController: ApplicationController;

  constructor() {
    this.applicationController = new ApplicationController();
  }

  public async start(): Promise<void> {
    try {
      await this.applicationController.initialize();
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }
}

// Bootstrap the application
const main = new Main();
main.start().catch((error) => {
  console.error('Unhandled error during application startup:', error);
  process.exit(1);
});