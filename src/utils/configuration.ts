import { IConfigurationManager, WindowConfiguration } from '../interfaces';
import { CONFIG } from '../types';

// Configuration Manager - Single Responsibility: Configuration management
export class ConfigurationManager implements IConfigurationManager {
  private static instance: ConfigurationManager;
  private config: Map<string, any> = new Map();

  private constructor() {
    this.initializeDefaults();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private initializeDefaults(): void {
    // Initialize with defaults from legacy CONFIG
    this.config.set('app.defaultTimeMinutes', CONFIG.DEFAULT_TIME_MINUTES);
    this.config.set('window.timer', CONFIG.TIMER_WINDOW);
    this.config.set('window.setup', CONFIG.SETUP_WINDOW);
    this.config.set('system.platform', process.platform);
  }

  public get<T>(key: string): T {
    return this.config.get(key) as T;
  }

  public set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  public getWindowConfig(type: 'main' | 'timer'): WindowConfiguration {
    if (type === 'main') {
      const setupConfig = this.get<typeof CONFIG.SETUP_WINDOW>('window.setup');
      return {
        width: setupConfig.WIDTH,
        height: setupConfig.HEIGHT,
        frame: true,
        alwaysOnTop: false,
        resizable: false,
      };
    }

    const timerConfig = this.get<typeof CONFIG.TIMER_WINDOW>('window.timer');
    return {
      width: timerConfig.WIDTH,
      height: timerConfig.HEIGHT,
      x: timerConfig.OFFSET_FROM_RIGHT,
      y: timerConfig.OFFSET_FROM_TOP,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      resizable: false,
    };
  }
}