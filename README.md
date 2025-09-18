# Electron Countdown Timer

A professional TypeScript-based countdown timer application built with Electron that enforces productivity by killing Chrome processes and locking the screen when time expires.

## 📋 Design Requirements

This application was built to meet specific productivity and usability requirements:

### Core Functionality
- **Timer Display**: Shows countdown in "MM:SS" format (e.g., "12:00")
- **Default Duration**: 12 minutes countdown timer
- **Time Controls**: Adjustment buttons for +1min, +10sec, -1min, -10sec
- **Timer Controls**: Start, Stop, Pause, Resume functionality
- **Platform**: Runs on macOS with system integration

### Two-Mode Interface Design

#### Setup Mode (Mode 1)
- **Window Size**: 320x300px for comfortable interaction
- **Position**: Centered on screen at startup
- **Visibility**: All timer adjustment buttons visible
- **Controls**: Full set of time adjustment and timer control buttons
- **Usage**: Configuration and timer setup phase

#### Timer Mode (Mode 2)
- **Window Size**: Ultra-compact 128x38px (1.5x scaled from 85x25px)
- **Position**: Top-right corner of screen (10px from top, 138px from right edge)
- **Frame**: Completely frameless window with no title bar or borders
- **Always-on-Top**: Floats above all content, including fullscreen applications
- **Controls**: Minimal interface showing only timer and pause/stop buttons
- **Typography**: Large 21px timer digits for readability
- **Transparency**: Semi-transparent dark background with blur effect

### Behavior Specifications

#### Timer Lifecycle
1. **Start**: Switches from Setup Mode to Timer Mode automatically
2. **Running**: Countdown updates every second, window stays minimal and floating
3. **Pause**: Button toggles between ⏸ (pause) and ▶️ (resume) icons
4. **Stop**: Resets timer to 12:00 and returns to Setup Mode
5. **Completion**: Executes system actions and returns to Setup Mode

#### System Integration (macOS)
- **Chrome Process Termination**: Kills all Google Chrome processes using `pkill -f "Google Chrome"`
- **Screen Lock**: Locks the screen using `pmset displaysleepnow`
- **Workspace Visibility**: Timer window visible on all virtual desktops and over fullscreen apps
- **Screen Saver Level**: Uses 'screen-saver' level for maximum always-on-top priority

### User Experience Requirements
- **Minimal Distraction**: Timer mode is as small as possible while remaining functional
- **Visual Feedback**: Clear button states and timer progression
- **Easy Access**: Timer controls accessible even in minimal mode
- **Reset Behavior**: Stop button always resets to default 12-minute duration
- **Persistent Visibility**: Timer never gets hidden behind other applications

## 🚀 Features

- **Dual Mode Interface**: Clean setup mode and minimal floating timer mode
- **Always-on-Top Timer**: Stays visible over fullscreen applications on macOS
- **System Integration**: Automatically kills Chrome processes and locks screen on completion
- **Responsive Controls**: Time adjustment buttons (+1min, +10sec, -1min, -10sec)
- **Pause/Resume**: Full timer control with visual feedback
- **TypeScript**: Full type safety and professional code organization

## 🛠️ Tech Stack

- **Electron**: Cross-platform desktop app framework
- **TypeScript**: Type-safe JavaScript with modern features
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Node.js**: Runtime environment

## 📦 Installation

```bash
npm install
```

## 🔧 Development

### Build the application
```bash
npm run build
```

### Start the application
```bash
npm start
```

### Development mode with auto-rebuild
```bash
npm run watch    # In one terminal
npm run dev      # In another terminal
```

### Code quality
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix auto-fixable linting errors
npm run format      # Format code with Prettier
```

## 📁 Project Structure

```
├── src/
│   ├── main.ts           # Main Electron process (TypeScript)
│   └── types.ts          # TypeScript type definitions
├── dist/
│   ├── main.js           # Compiled main process
│   └── types.js          # Compiled type definitions
├── renderer.js           # Main window renderer (optimized JavaScript)
├── index.html           # Main window HTML
├── timer.html           # Timer window HTML (with inline script)
├── styles.css           # Application styles
└── tsconfig.json        # TypeScript configuration
```

## 🎮 Usage

1. **Setup Mode**:
   - Adjust timer using +/- buttons (default: 12 minutes)
   - Click "Start" to begin countdown

2. **Timer Mode**:
   - Window becomes minimal and floats in top-right corner
   - Shows time remaining with pause/stop controls
   - Stays on top of all applications

3. **Completion**:
   - Kills all Chrome processes
   - Locks the screen (macOS)
   - Returns to setup mode

## 📐 Technical Design Specifications

### Window Configuration
```typescript
// Setup Mode (Mode 1)
SETUP_WINDOW: {
  WIDTH: 320px,
  HEIGHT: 300px,
  POSITION: "centered",
  FRAME: true,
  ALWAYS_ON_TOP: false
}

// Timer Mode (Mode 2)
TIMER_WINDOW: {
  WIDTH: 128px,
  HEIGHT: 38px,
  POSITION: "top-right (10px from top, 138px from right)",
  FRAME: false,
  ALWAYS_ON_TOP: true,
  LEVEL: "screen-saver",
  TRANSPARENT: true,
  SKIP_TASKBAR: true
}
```

### Typography & Styling
```css
/* Setup Mode Timer Display */
font-size: 48px;
font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
color: #00ff88;

/* Timer Mode Display */
font-size: 21px; /* 1.5x scaling */
font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
color: #00ff88;
background: rgba(0, 0, 0, 0.9);
border-radius: 5px;
backdrop-filter: blur(10px);
```

### Control Button Specifications
```typescript
// Time Adjustment Buttons
BUTTONS: ["-1min", "-10sec", "+10sec", "+1min"]
ADJUSTMENTS: [-60, -10, +10, +60] // seconds

// Timer Control Buttons
CONTROLS: ["Start", "Stop", "Pause/Resume"]
ICONS: {
  PAUSE: "⏸",
  RESUME: "▶️",
  STOP: "⏹"
}
```

### System Commands (macOS)
```bash
# Kill Chrome Processes
pkill -f "Google Chrome"

# Lock Screen
pmset displaysleepnow
```

## ⚙️ Configuration

Default settings can be modified in `src/types.ts`:

```typescript
export const CONFIG = {
  DEFAULT_TIME_MINUTES: 12,  // Default timer duration
  TIMER_WINDOW: {
    WIDTH: 128,              // Timer window width
    HEIGHT: 38,              // Timer window height
    OFFSET_FROM_RIGHT: 138,  // Distance from right edge
    OFFSET_FROM_TOP: 10,     // Distance from top edge
  },
  SETUP_WINDOW: {
    WIDTH: 320,              // Setup window width
    HEIGHT: 300,             // Setup window height
  }
} as const;
```

## 🏗️ Architecture Improvements

### From JavaScript to TypeScript

- **Type Safety**: Prevents runtime errors with compile-time checking
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Code Documentation**: Types serve as inline documentation
- **Maintainability**: Easier to understand and modify code

### Professional Code Organization

- **Separation of Concerns**: Clear distinction between main/renderer processes
- **Error Handling**: Proper error catching and logging
- **Configuration Management**: Centralized constants and settings
- **Clean Architecture**: Well-defined interfaces and data structures

### Development Workflow

- **Automated Building**: TypeScript compilation pipeline
- **Code Quality Tools**: ESLint and Prettier integration
- **VS Code Integration**: Optimized development experience

## 🔒 Security Features

- **Process Isolation**: Uses Electron's security best practices
- **System Commands**: Controlled execution of macOS system commands
- **Error Boundaries**: Graceful error handling

## 📋 Requirements

- **macOS**: Required for screen lock and Chrome process management
- **Node.js**: v14 or higher
- **Chrome**: For process termination feature

## 🐛 Troubleshooting

### Build Issues
```bash
npm run clean  # Clear dist folder
npm run build  # Rebuild
```

### Permission Issues
Ensure the app has necessary permissions for:
- Screen control (for locking)
- Process management (for killing Chrome)

## 📝 License

ISC License - See package.json for details.