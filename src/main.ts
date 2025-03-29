// Entry point
import { Engine } from './core/Engine';
import { initializeDebugUI } from './debug'; // Import the debug UI initializer
import { initializeRapier } from './systems/PhysicsSystem'; // Import Rapier initializer

// Main asynchronous function to setup and run the application
async function main() {
    // --- Initialization --- 
    // 1. Initialize Physics Engine (WASM)
    await initializeRapier();

    // 2. Initialize Debug UI (React)
    // We find the element here, but render happens after Engine start potentially
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
    if (!canvas) {
        console.error("Could not find canvas element with id 'gameCanvas'");
        return; // Stop execution if canvas isn't found
    }
    
    // 3. Initialize Core Engine (BEFORE Debug UI needs it)
    const engine = new Engine(canvas);

    // 4. Initialize Debug UI (passing engine instance)
    initializeDebugUI(engine); 

    // --- Start the Engine --- 
    engine.start();

    // --- Cleanup --- 
    window.addEventListener('beforeunload', () => {
        engine.dispose();
    });
}

// --- Run the Application ---
main().catch(error => {
    console.error("Failed to initialize or run the application:", error);
});
