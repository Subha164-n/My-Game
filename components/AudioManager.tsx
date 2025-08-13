import { useRef, useCallback, useEffect } from 'react';

export interface AudioManager {
  playShoot: () => void;
  playExplosion: () => void;
  playGameOver: () => void;
  playGameStart: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
}

export function useAudioManager(): AudioManager {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const backgroundGainRef = useRef<GainNode | null>(null);
  const mutedRef = useRef(false);
  const musicNotesRef = useRef(0);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if it's suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  const playShoot = useCallback(() => {
    if (mutedRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play shoot sound:', error);
    }
  }, [getAudioContext]);

  const playExplosion = useCallback(() => {
    if (mutedRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Create noise for explosion
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();
      
      source.buffer = buffer;
      source.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, ctx.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      source.start(ctx.currentTime);
    } catch (error) {
      console.warn('Could not play explosion sound:', error);
    }
  }, [getAudioContext]);

  const playGameOver = useCallback(() => {
    if (mutedRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const notes = [440, 392, 349, 294]; // A, G, F, D
      
      notes.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.3);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.3);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.3 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.3 + 0.25);
        
        oscillator.start(ctx.currentTime + index * 0.3);
        oscillator.stop(ctx.currentTime + index * 0.3 + 0.3);
      });
    } catch (error) {
      console.warn('Could not play game over sound:', error);
    }
  }, [getAudioContext]);

  const playGameStart = useCallback(() => {
    if (mutedRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const notes = [523, 659, 784]; // C, E, G (major chord)
      
      notes.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + index * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.4);
        
        oscillator.start(ctx.currentTime + index * 0.1);
        oscillator.stop(ctx.currentTime + index * 0.1 + 0.5);
      });
    } catch (error) {
      console.warn('Could not play game start sound:', error);
    }
  }, [getAudioContext]);

  const playBackgroundNote = useCallback(() => {
    if (mutedRef.current || !backgroundGainRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Simple melody pattern
      const melody = [523, 659, 784, 523, 659, 698, 784, 659]; // C, E, G, C, E, F, G, E
      const note = melody[musicNotesRef.current % melody.length];
      musicNotesRef.current++;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(backgroundGainRef.current);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play background note:', error);
    }
  }, [getAudioContext]);

  const startBackgroundMusic = useCallback(() => {
    if (mutedRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Create background gain node
      if (!backgroundGainRef.current) {
        backgroundGainRef.current = ctx.createGain();
        backgroundGainRef.current.connect(ctx.destination);
        backgroundGainRef.current.gain.setValueAtTime(0.3, ctx.currentTime);
      }
      
      // Start the melody loop
      if (!musicIntervalRef.current) {
        playBackgroundNote(); // Play first note immediately
        musicIntervalRef.current = setInterval(playBackgroundNote, 800);
      }
    } catch (error) {
      console.warn('Could not start background music:', error);
    }
  }, [getAudioContext, playBackgroundNote]);

  const stopBackgroundMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    
    if (backgroundGainRef.current) {
      backgroundGainRef.current.disconnect();
      backgroundGainRef.current = null;
    }
    
    musicNotesRef.current = 0;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    
    if (muted) {
      stopBackgroundMusic();
    }
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('spaceShooterMuted', muted.toString());
    }
  }, [stopBackgroundMusic]);

  const isMuted = useCallback(() => {
    return mutedRef.current;
  }, []);

  // Initialize muted state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spaceShooterMuted');
      if (stored) {
        mutedRef.current = stored === 'true';
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopBackgroundMusic]);

  return {
    playShoot,
    playExplosion,
    playGameOver,
    playGameStart,
    startBackgroundMusic,
    stopBackgroundMusic,
    setMuted,
    isMuted,
  };
}