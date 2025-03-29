# Game Boilerplate

A modern TypeScript game boilerplate using Three.js, Rapier physics, React for UI, and a clean, modular architecture.

## Features

- **Modern TypeScript** with strict typing
- **Three.js** for 3D rendering
- **Rapier Physics** for realistic physics simulation
- **React-based Debug UI** with Leva controls
- **Zustand State Management** for clean, reactive state
- **Modular Systems Architecture**
  - Camera system with first/third-person modes
  - Input system with rebindable actions
  - Physics system with debug visualization
  - Player movement system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone this repository
git clone https://github.com/ajamix/game-boilerplate.git
cd game-boilerplate

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configuration

The project uses environment variables for configuration. Copy `.env.example` to `.env` to set up your local environment:

```bash
cp .env.example .env
```

#### Debug Configuration

Environment variables for debug features:

- `VITE_DEBUG_MODE`: Master toggle for all debug features (set to `false` in production)
- `VITE_SHOW_PHYSICS_DEBUG`: Show physics collision wireframes
- `VITE_SHOW_FPS_COUNTER`: Show FPS counter
- `VITE_SHOW_DEBUG_PANEL`: Show debug control panels

## Architecture

The project follows a modular architecture with clear separation of concerns:

- **Core**: Game loop, engine, and time management
- **Systems**: Modular game systems (physics, input, player, camera)
- **State**: Zustand stores for state management
- **Components**: React components for UI and debugging
- **Config**: Configuration files and constants
- **Scenes**: Game scene management

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 