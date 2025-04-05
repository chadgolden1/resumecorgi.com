import { useRef, useCallback } from 'react';

interface DebounceConfig {
  initialDebounceMs: number;
  minDebounceMs: number;
  maxDebounceMs: number;
  typingTimeoutMs: number;
}

interface AdaptiveDebounceResult {
  getCurrentDebounceTime: () => number;
  updateCompilationTime: (time: number) => void;
  isTyping: () => boolean;
  startTypingMode: () => void;
  debounce: <T extends (...args: any[]) => any>(
    fn: T,
    dependencies?: React.DependencyList
  ) => (...args: Parameters<T>) => void;
}

/**
 * Custom hook for implementing adaptive debounce timing based on compilation performance
 */
export const useAdaptiveDebounce = (
  config: DebounceConfig = {
    initialDebounceMs: 300,
    minDebounceMs: 50,
    maxDebounceMs: 600,
    typingTimeoutMs: 1000
  }
): AdaptiveDebounceResult => {
  // Track compilation times to adjust debounce dynamically
  const compilationTimesRef = useRef<number[]>([]);
  
  // Current debounce time
  const debounceTimeRef = useRef<number>(config.initialDebounceMs);
  
  // Typing mode tracking
  const isTypingRef = useRef<boolean>(false);
  const typingModeTimerRef = useRef<number | null>(null);
  
  // Debounce timer reference
  const timerRef = useRef<number | null>(null);
  
  /**
   * Updates the adaptive debounce time based on recent compilation performance
   */
  const updateCompilationTime = useCallback((compilationTime: number) => {
    // Keep track of the last 5 compilation times
    compilationTimesRef.current.push(compilationTime);
    if (compilationTimesRef.current.length > 5) {
      compilationTimesRef.current.shift();
    }
    
    // Calculate average compilation time
    const avgCompilationTime = compilationTimesRef.current.reduce(
      (sum, time) => sum + time, 0
    ) / compilationTimesRef.current.length;
    
    // Set debounce time based on compilation time
    // For fast machines: debounce less (more responsive)
    // For slow machines: debounce more (avoid too many compilations)
    if (isTypingRef.current) {
      // During active typing, use larger debounce to avoid overwhelming the system
      debounceTimeRef.current = Math.min(
        Math.max(avgCompilationTime * 0.8, config.minDebounceMs), 
        config.maxDebounceMs
      );
    } else {
      // When not actively typing, we can be more responsive
      debounceTimeRef.current = Math.min(
        Math.max(avgCompilationTime * 0.4, config.minDebounceMs),
        config.maxDebounceMs / 2
      );
    }
  }, [config.maxDebounceMs, config.minDebounceMs]);

  /**
   * Starts typing mode, which increases debounce time
   */
  const startTypingMode = useCallback(() => {
    isTypingRef.current = true;
    
    // Clear existing typing mode timer
    if (typingModeTimerRef.current) {
      window.clearTimeout(typingModeTimerRef.current);
    }
    
    // Set a new typing mode timer
    typingModeTimerRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
    }, config.typingTimeoutMs);
  }, [config.typingTimeoutMs]);

  /**
   * Creates a debounced version of the provided function
   */
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    dependencies: React.DependencyList = []
  ) => {
    return (...args: Parameters<T>) => {
      // Start typing mode
      startTypingMode();
      
      // Clear any existing timer
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      
      // Set new timer with current adaptive debounce time
      timerRef.current = window.setTimeout(() => {
        fn(...args);
        timerRef.current = null;
      }, debounceTimeRef.current);
    };
  }, [startTypingMode]);

  return {
    getCurrentDebounceTime: () => debounceTimeRef.current,
    updateCompilationTime,
    isTyping: () => isTypingRef.current,
    startTypingMode,
    debounce
  };
};