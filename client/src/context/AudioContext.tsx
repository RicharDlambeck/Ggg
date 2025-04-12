import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioPlayer, initializeAudio } from '@/lib/audio';

interface AudioContextType {
  instrumentalPlayer: AudioPlayer | null;
  vocalPlayer: AudioPlayer | null;
  mixedPlayer: AudioPlayer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playPause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setInstrumentalVolume: (volume: number) => void;
  setVocalVolume: (volume: number) => void;
  instrumentalVolume: number;
  vocalVolume: number;
  loadInstrumental: (url: string) => Promise<void>;
  loadVocal: (url: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [instrumentalVolume, setInstrumentalVolume] = useState(0.8);
  const [vocalVolume, setVocalVolume] = useState(0.8);
  
  const instrumentalPlayerRef = useRef<AudioPlayer | null>(null);
  const vocalPlayerRef = useRef<AudioPlayer | null>(null);
  const mixedPlayerRef = useRef<AudioPlayer | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    const setup = async () => {
      await initializeAudio();
      
      instrumentalPlayerRef.current = new AudioPlayer();
      vocalPlayerRef.current = new AudioPlayer();
      mixedPlayerRef.current = new AudioPlayer();
      
      instrumentalPlayerRef.current.onTimeUpdate((time) => {
        setCurrentTime(time);
      });
      
      instrumentalPlayerRef.current.onPlay(() => {
        setIsPlaying(true);
      });
      
      instrumentalPlayerRef.current.onPause(() => {
        setIsPlaying(false);
      });
      
      instrumentalPlayerRef.current.onStop(() => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      // Set initial volumes
      instrumentalPlayerRef.current.setVolume(instrumentalVolume);
      vocalPlayerRef.current.setVolume(vocalVolume);
      
      setIsInitialized(true);
    };
    
    setup();
    
    // Cleanup on unmount
    return () => {
      if (instrumentalPlayerRef.current) {
        instrumentalPlayerRef.current.dispose();
      }
      if (vocalPlayerRef.current) {
        vocalPlayerRef.current.dispose();
      }
      if (mixedPlayerRef.current) {
        mixedPlayerRef.current.dispose();
      }
    };
  }, []);

  const playPause = () => {
    if (!instrumentalPlayerRef.current) return;
    
    if (isPlaying) {
      instrumentalPlayerRef.current.pause();
      if (vocalPlayerRef.current) vocalPlayerRef.current.pause();
    } else {
      instrumentalPlayerRef.current.play();
      if (vocalPlayerRef.current) vocalPlayerRef.current.play();
    }
  };

  const stop = () => {
    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.stop();
    }
    if (vocalPlayerRef.current) {
      vocalPlayerRef.current.stop();
    }
  };

  const seek = (time: number) => {
    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.seek(time);
    }
    if (vocalPlayerRef.current) {
      vocalPlayerRef.current.seek(time);
    }
  };

  const updateInstrumentalVolume = (volume: number) => {
    setInstrumentalVolume(volume);
    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.setVolume(volume);
    }
  };

  const updateVocalVolume = (volume: number) => {
    setVocalVolume(volume);
    if (vocalPlayerRef.current) {
      vocalPlayerRef.current.setVolume(volume);
    }
  };

  const loadInstrumental = async (url: string) => {
    if (!instrumentalPlayerRef.current) return;
    
    await instrumentalPlayerRef.current.loadAudio(url);
    setDuration(instrumentalPlayerRef.current.getDuration());
  };

  const loadVocal = async (url: string) => {
    if (!vocalPlayerRef.current) return;
    
    await vocalPlayerRef.current.loadAudio(url);
  };

  return (
    <AudioContext.Provider
      value={{
        instrumentalPlayer: instrumentalPlayerRef.current,
        vocalPlayer: vocalPlayerRef.current,
        mixedPlayer: mixedPlayerRef.current,
        isPlaying,
        currentTime,
        duration,
        playPause,
        stop,
        seek,
        setInstrumentalVolume: updateInstrumentalVolume,
        setVocalVolume: updateVocalVolume,
        instrumentalVolume,
        vocalVolume,
        loadInstrumental,
        loadVocal
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
