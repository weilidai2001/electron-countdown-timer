import { ipcRenderer } from 'electron';
import {
  CONFIG,
  TimerState,
  TimerDisplayElements,
  TimerUpdateData,
  Seconds,
  TimerError,
} from './types';

class CountdownTimer {
  private readonly DEFAULT_TIME: Seconds = CONFIG.DEFAULT_TIME_MINUTES * 60;
  private timeLeft: Seconds = this.DEFAULT_TIME;
  private state: TimerState = 'stopped';
  private intervalId: NodeJS.Timeout | null = null;
  private isTimerMode = false;
  private elements: TimerDisplayElements;

  constructor() {
    this.elements = this.initializeElements();
    this.attachEventListeners();
    this.updateDisplay();
    this.setupIpcListeners();
  }

  private initializeElements(): TimerDisplayElements {
    const getElement = <T extends HTMLElement>(id: string): T => {
      const element = document.getElementById(id) as T | null;
      if (!element) {
        throw new TimerError(`Element with id '${id}' not found`);
      }
      return element;
    };

    return {
      setupMode: getElement('setup-mode'),
      timerMode: getElement('timer-mode'),
      timerText: getElement('timer-text'),
      miniTimerText: getElement('mini-timer-text'),
      minus1MinBtn: getElement<HTMLButtonElement>('minus-1min'),
      minus10SecBtn: getElement<HTMLButtonElement>('minus-10sec'),
      plus10SecBtn: getElement<HTMLButtonElement>('plus-10sec'),
      plus1MinBtn: getElement<HTMLButtonElement>('plus-1min'),
      startBtn: getElement<HTMLButtonElement>('start-btn'),
      stopBtn: getElement<HTMLButtonElement>('stop-btn'),
      pauseBtn: getElement<HTMLButtonElement>('pause-btn'),
    };
  }

  private attachEventListeners(): void {
    this.elements.minus1MinBtn.addEventListener('click', () =>
      this.adjustTime(-60)
    );
    this.elements.minus10SecBtn.addEventListener('click', () =>
      this.adjustTime(-10)
    );
    this.elements.plus10SecBtn.addEventListener('click', () =>
      this.adjustTime(10)
    );
    this.elements.plus1MinBtn.addEventListener('click', () =>
      this.adjustTime(60)
    );

    this.elements.startBtn.addEventListener('click', () => this.startTimer());
    this.elements.stopBtn.addEventListener('click', () => this.stopTimer());
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
  }

  private setupIpcListeners(): void {
    ipcRenderer.on('toggle-pause-from-timer', () => {
      this.togglePause();
    });

    ipcRenderer.on('stop-timer-from-timer', () => {
      this.stopTimer();
    });
  }

  private adjustTime(seconds: Seconds): void {
    if (this.state === 'running') return;

    this.timeLeft = Math.max(0, this.timeLeft + seconds);
    this.updateDisplay();
  }

  private formatTime(seconds: Seconds): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  private updateDisplay(): void {
    const timeString = this.formatTime(this.timeLeft);
    this.elements.timerText.textContent = timeString;
    this.elements.miniTimerText.textContent = timeString;

    if (this.isTimerMode) {
      void this.updateTimerWindow({
        timeLeft: this.timeLeft,
        isPaused: this.state === 'paused',
      });
    }
  }

  private async updateTimerWindow(data: TimerUpdateData): Promise<void> {
    try {
      await ipcRenderer.invoke('update-timer-display', data);
    } catch (error) {
      console.error('Failed to update timer window:', error);
    }
  }

  private async startTimer(): Promise<void> {
    if (this.timeLeft === 0) return;

    this.state = 'running';
    this.updateButtonStates();

    try {
      await this.switchToTimerMode();
      this.runCountdown();
    } catch (error) {
      console.error('Failed to start timer:', error);
      this.state = 'stopped';
      this.updateButtonStates();
    }
  }

  private stopTimer(): void {
    this.state = 'stopped';
    this.clearCountdownInterval();

    this.timeLeft = this.DEFAULT_TIME;
    this.updateDisplay();
    this.updateButtonStates();

    void this.switchToSetupMode();
  }

  private togglePause(): void {
    if (this.state !== 'running' && this.state !== 'paused') return;

    this.state = this.state === 'paused' ? 'running' : 'paused';

    if (this.state === 'paused') {
      this.clearCountdownInterval();
    } else {
      this.runCountdown();
    }

    this.updateButtonStates();
    this.updateDisplay();
  }

  private updateButtonStates(): void {
    const isRunning = this.state === 'running';
    const isPaused = this.state === 'paused';

    this.elements.startBtn.disabled = isRunning || isPaused;
    this.elements.stopBtn.disabled = this.state === 'stopped';

    if (isRunning || isPaused) {
      this.elements.startBtn.textContent = 'Running';
    } else {
      this.elements.startBtn.textContent = 'Start';
    }

    this.elements.pauseBtn.textContent = isPaused ? '▶️' : '⏸';
  }

  private runCountdown(): void {
    this.clearCountdownInterval();

    this.intervalId = setInterval(() => {
      if (this.state === 'paused') return;

      this.timeLeft--;
      this.updateDisplay();

      if (this.timeLeft <= 0) {
        void this.timerFinished();
      }
    }, 1000);
  }

  private clearCountdownInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async timerFinished(): Promise<void> {
    this.state = 'stopped';
    this.clearCountdownInterval();

    try {
      await ipcRenderer.invoke('timer-finished');
    } catch (error) {
      console.error('Failed to handle timer finished:', error);
    }

    this.timeLeft = this.DEFAULT_TIME;
    this.updateDisplay();
    this.updateButtonStates();

    await this.switchToSetupMode();
  }

  private async switchToTimerMode(): Promise<void> {
    this.isTimerMode = true;
    this.elements.setupMode.classList.add('hidden');
    this.elements.timerMode.classList.remove('hidden');

    try {
      await ipcRenderer.invoke('switch-to-timer-mode');
    } catch (error) {
      console.error('Failed to switch to timer mode:', error);
      throw new TimerError('Failed to switch to timer mode');
    }
  }

  private async switchToSetupMode(): Promise<void> {
    this.isTimerMode = false;
    this.elements.timerMode.classList.add('hidden');
    this.elements.setupMode.classList.remove('hidden');

    try {
      await ipcRenderer.invoke('switch-to-setup-mode');
    } catch (error) {
      console.error('Failed to switch to setup mode:', error);
    }
  }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new CountdownTimer();
  } catch (error) {
    console.error('Failed to initialize CountdownTimer:', error);
  }
});