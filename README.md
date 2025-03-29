# Game Boilerplate

A modern TypeScript game boilerplate using Three.js, Rapier physics, React for UI, and a clean, modular architecture following strict software engineering principles.

## Features

- **Modern TypeScript** with strict typing and comprehensive type definitions
- **Three.js** for powerful 3D rendering
- **Rapier Physics** for realistic physics simulation
- **React-based Debug UI** with Leva controls
- **Zustand State Management** for clean, reactive state
- **ESLint Integration** for consistent code quality
- **Vitest Testing Framework** for unit testing

### Architecture Highlights

- **Clean, Modular Architecture**
  - Strict single-responsibility principle
  - Clear separation of concerns
  - Type-safe interfaces
  - Maximum file size limit (< 200 lines)
  
- **Camera System**
  - Supports first-person and third-person modes
  - Smooth camera transitions
  - Position and rotation interpolation

- **Input System**
  - Action-based input mapping
  - Rebindable controls
  - Pointer lock for immersive mouse control

- **Physics System**
  - Integration with Rapier 3D physics
  - Debug visualization tools
  - Collision detection

- **Player Movement System**
  - Camera-relative movement
  - Physics-based movement
  - Jump, run, and other actions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone this repository
git clone https://github.com/yourusername/game-boilerplate.git
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

## Project Structure

```
src/
├── components/        # React UI components
├── config/            # Configuration files
├── core/              # Core engine functionality
├── enums/             # Enum type definitions
├── scenes/            # Game scenes
├── state/             # Zustand state stores
├── systems/           # Game systems
└── types/             # TypeScript interfaces and types
```

### Architectural Principles

The project adheres to the following architectural principles:

1. **Type Safety**: Strict TypeScript typing throughout the codebase
2. **Separation of Concerns**: Each file and system has a single responsibility
3. **State Management**: Zustand stores for shared state without global variables
4. **Update/Render Separation**: Clean separation in the game loop
5. **Dependency Injection**: Systems receive dependencies rather than accessing globals
6. **Modular Design**: Small, focused modules with clear interfaces

## Game Systems

### Core Loop

The game uses a fixed-step loop with separate update and render phases:

```typescript
loop.onUpdate((delta, elapsed) => {
  // Update game logic here
  inputSystem.update();
  playerSystem.update(playerBody, playerMesh, delta);
  physicsSystem.step(delta);
});

loop.onRender(() => {
  // Render graphics here
  renderer.render(scene, camera);
});
```

### Input System

The input system translates keyboard and mouse events into abstract game actions:

- Maps physical inputs to logical actions
- Handles pointer lock for mouse control
- Prevents default browser behavior for game inputs

### Physics System

The physics system uses Rapier for realistic physics:

- Rigid body simulation
- Collision detection
- Debug rendering for physics shapes

### Camera System

The camera system provides flexible viewing options:

- First-person view for immersive gameplay
- Third-person view for character awareness
- Smooth transitions between camera modes

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

## Performance Optimization

- Separation of client and server components
- Minimal use of `useEffect` and `useState`
- Physics performance tuning
- Optimized rendering

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ by [DevsMint](https://devsmint.com) 