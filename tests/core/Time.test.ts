import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Time } from '../../src/core/Time';

describe('Time Class', () => {
    let baseTime = 10000; // Start time in ms
    let mockNow = baseTime;

    beforeEach(() => {
        // Reset mock time before each test
        mockNow = baseTime;
        // Mock performance.now()
        vi.spyOn(performance, 'now').mockImplementation(() => mockNow);
    });

    afterEach(() => {
        // Restore original performance.now
        vi.restoreAllMocks();
    });

    it('should initialize with zero delta and elapsed time', () => {
        const time = new Time();
        expect(time.delta).toBe(0);
        expect(time.elapsed).toBe(0);
    });

    it('should calculate delta time correctly after first update', () => {
        const time = new Time();
        const advanceMs = 16; // Simulate roughly 60fps
        mockNow += advanceMs;

        time.update();

        // Delta should be advanceMs / 1000 (in seconds)
        expect(time.delta).toBeCloseTo(advanceMs / 1000);
        expect(time.elapsed).toBeCloseTo(advanceMs / 1000);
    });

    it('should accumulate elapsed time over multiple updates', () => {
        const time = new Time();
        const advanceMs1 = 16;
        const advanceMs2 = 32;

        // First update
        mockNow += advanceMs1;
        time.update();
        expect(time.delta).toBeCloseTo(advanceMs1 / 1000);
        expect(time.elapsed).toBeCloseTo(advanceMs1 / 1000);

        // Second update
        mockNow += advanceMs2;
        time.update();
        expect(time.delta).toBeCloseTo(advanceMs2 / 1000);
        expect(time.elapsed).toBeCloseTo((advanceMs1 + advanceMs2) / 1000);
    });

    it('should clamp delta time to a maximum of 0.1 seconds', () => {
        const time = new Time();
        const largeAdvanceMs = 500; // 0.5 seconds
        mockNow += largeAdvanceMs;

        time.update();

        // Delta should be clamped
        expect(time.delta).toBe(0.1);
        
        // NOTE: Elapsed still uses the unclamped delta (0.5s)
        // If we wanted elapsed to use clamped delta, Time.ts would need to be modified
        expect(time.elapsed).toBe(0.5);
    });
}); 