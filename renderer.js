const { ipcRenderer } = require('electron');

class CountdownTimer {
    constructor() {
        this.DEFAULT_TIME = 12 * 60; // 12 minutes in seconds
        this.timeLeft = this.DEFAULT_TIME;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.isTimerMode = false;

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();

        // Listen for pause toggle from timer window
        ipcRenderer.on('toggle-pause-from-timer', () => {
            this.togglePause();
        });

        // Listen for stop from timer window
        ipcRenderer.on('stop-timer-from-timer', () => {
            this.stopTimer();
        });
    }

    initializeElements() {
        this.setupMode = document.getElementById('setup-mode');
        this.timerMode = document.getElementById('timer-mode');
        this.timerText = document.getElementById('timer-text');
        this.miniTimerText = document.getElementById('mini-timer-text');

        this.minus1MinBtn = document.getElementById('minus-1min');
        this.minus10SecBtn = document.getElementById('minus-10sec');
        this.plus10SecBtn = document.getElementById('plus-10sec');
        this.plus1MinBtn = document.getElementById('plus-1min');

        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.pauseBtn = document.getElementById('pause-btn');
    }

    attachEventListeners() {
        this.minus1MinBtn.addEventListener('click', () => this.adjustTime(-60));
        this.minus10SecBtn.addEventListener('click', () => this.adjustTime(-10));
        this.plus10SecBtn.addEventListener('click', () => this.adjustTime(10));
        this.plus1MinBtn.addEventListener('click', () => this.adjustTime(60));

        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
    }

    adjustTime(seconds) {
        if (this.isRunning) return;

        this.timeLeft = Math.max(0, this.timeLeft + seconds);
        this.updateDisplay();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        const timeString = this.formatTime(this.timeLeft);
        this.timerText.textContent = timeString;
        this.miniTimerText.textContent = timeString;

        // Update timer window if in timer mode
        if (this.isTimerMode) {
            ipcRenderer.invoke('update-timer-display', {
                timeLeft: this.timeLeft,
                isPaused: this.isPaused
            });
        }
    }

    async startTimer() {
        if (this.timeLeft === 0) return;

        this.isRunning = true;
        this.isPaused = false;

        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.startBtn.textContent = 'Running';

        await this.switchToTimerMode();
        this.runCountdown();
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.intervalId);

        // Reset timer to default time
        this.timeLeft = this.DEFAULT_TIME;
        this.updateDisplay();

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.startBtn.textContent = 'Start';
        this.pauseBtn.textContent = '⏸';

        this.switchToSetupMode();
    }

    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            clearInterval(this.intervalId);
            this.pauseBtn.textContent = '▶️';
        } else {
            this.runCountdown();
            this.pauseBtn.textContent = '⏸';
        }

        // Update timer window with new pause state
        this.updateDisplay();
    }

    runCountdown() {
        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.timerFinished();
            }
        }, 1000);
    }

    async timerFinished() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.intervalId);

        await ipcRenderer.invoke('timer-finished');

        this.timeLeft = this.DEFAULT_TIME;
        this.updateDisplay();
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.startBtn.textContent = 'Start';
        this.pauseBtn.textContent = '⏸';

        await this.switchToSetupMode();
    }

    async switchToTimerMode() {
        this.isTimerMode = true;
        this.setupMode.classList.add('hidden');
        this.timerMode.classList.remove('hidden');

        await ipcRenderer.invoke('switch-to-timer-mode');
    }

    async switchToSetupMode() {
        this.isTimerMode = false;
        this.timerMode.classList.add('hidden');
        this.setupMode.classList.remove('hidden');

        await ipcRenderer.invoke('switch-to-setup-mode');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
});