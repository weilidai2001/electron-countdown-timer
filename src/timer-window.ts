import { ipcRenderer } from 'electron';
import { CONFIG, TimerUpdateData, Seconds } from './types';

class TimerWindow {
  private readonly DEFAULT_TIME: Seconds = CONFIG.DEFAULT_TIME_MINUTES * 60;
  private timeLeft: Seconds = this.DEFAULT_TIME;
  private isPaused = false;

  private readonly timerText: HTMLElement;
  private readonly pauseBtn: HTMLButtonElement;
  private readonly stopBtn: HTMLButtonElement;

  constructor() {
    this.timerText = this.getElementById('timer-text');
    this.pauseBtn = this.getElementById<HTMLButtonElement>('pause-btn');
    this.stopBtn = this.getElementById<HTMLButtonElement>('stop-btn');

    this.attachEventListeners();
    this.setupIpcListeners();
    this.updateDisplay();
  }

  private getElementById<T extends HTMLElement = HTMLElement>(
    id: string
  ): T {
    const element = document.getElementById(id) as T | null;
    if (!element) {
      throw new Error(`Element with id '${id}' not found`);
    }
    return element;
  }

  private attachEventListeners(): void {
    this.pauseBtn.addEventListener('click', () => {
      void this.handlePauseClick();
    });

    this.stopBtn.addEventListener('click', () => {
      void this.handleStopClick();
    });
  }

  private setupIpcListeners(): void {
    ipcRenderer.on('timer-update', (_, data: TimerUpdateData) => {
      this.handleTimerUpdate(data);
    });
  }

  private async handlePauseClick(): Promise<void> {
    try {
      await ipcRenderer.invoke('toggle-pause');
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  }

  private async handleStopClick(): Promise<void> {
    try {
      await ipcRenderer.invoke('stop-timer');
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  }

  private handleTimerUpdate(data: TimerUpdateData): void {
    this.timeLeft = data.timeLeft;
    this.isPaused = data.isPaused;
    this.updateDisplay();
    this.updatePauseButton();
  }

  private formatTime(seconds: Seconds): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  private updateDisplay(): void {
    this.timerText.textContent = this.formatTime(this.timeLeft);
  }

  private updatePauseButton(): void {
    this.pauseBtn.textContent = this.isPaused ? '▶️' : '⏸';
  }
}

// Initialize the timer window when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new TimerWindow();
  } catch (error) {
    console.error('Failed to initialize TimerWindow:', error);
  }
});