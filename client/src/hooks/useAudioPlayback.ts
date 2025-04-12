import { useState, useEffect, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export interface UseAudioPlaybackOptions {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onFinish?: () => void;
}

export function useAudioPlayback(
  wavesurfer: WaveSurfer | null,
  options: UseAudioPlaybackOptions = {}
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!wavesurfer) return;
    
    const handlePlay = () => {
      if (isMountedRef.current) {
        setIsPlaying(true);
        if (options.onPlay) options.onPlay();
      }
    };
    
    const handlePause = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
        if (options.onPause) options.onPause();
      }
    };
    
    const handleFinish = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
        if (options.onFinish) options.onFinish();
      }
    };
    
    const handleTimeUpdate = () => {
      if (isMountedRef.current) {
        setCurrentTime(wavesurfer.getCurrentTime());
      }
    };
    
    const handleReady = () => {
      if (isMountedRef.current) {
        setDuration(wavesurfer.getDuration());
      }
    };
    
    // Set up event listeners
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('pause', handlePause);
    wavesurfer.on('finish', handleFinish);
    wavesurfer.on('audioprocess', handleTimeUpdate);
    wavesurfer.on('ready', handleReady);
    
    // Set initial duration if already loaded
    if (wavesurfer.getDuration()) {
      setDuration(wavesurfer.getDuration());
    }
    
    // Clean up event listeners on unmount
    return () => {
      wavesurfer.un('play', handlePlay);
      wavesurfer.un('pause', handlePause);
      wavesurfer.un('finish', handleFinish);
      wavesurfer.un('audioprocess', handleTimeUpdate);
      wavesurfer.un('ready', handleReady);
    };
  }, [wavesurfer, options]);

  // Start or pause playback
  const togglePlayback = useCallback(() => {
    if (!wavesurfer) return;
    
    if (isPlaying) {
      wavesurfer.pause();
    } else {
      wavesurfer.play();
    }
  }, [wavesurfer, isPlaying]);

  // Stop playback and return to beginning
  const stopPlayback = useCallback(() => {
    if (!wavesurfer) return;
    
    wavesurfer.stop();
    if (options.onStop) options.onStop();
  }, [wavesurfer, options]);

  // Seek to a specific time in seconds
  const seekTo = useCallback((time: number) => {
    if (!wavesurfer) return;
    
    wavesurfer.seekTo(time / duration);
  }, [wavesurfer, duration]);

  // Seek forward or backward by a specified number of seconds
  const seek = useCallback((seconds: number) => {
    if (!wavesurfer) return;
    
    const currentTime = wavesurfer.getCurrentTime();
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    wavesurfer.seekTo(newTime / duration);
  }, [wavesurfer, duration]);

  // Shorthand functions for seeking
  const seekForward = useCallback(() => seek(5), [seek]);
  const seekBackward = useCallback(() => seek(-5), [seek]);

  // Set the audio volume (0-1)
  const setAudioVolume = useCallback((value: number) => {
    if (!wavesurfer) return;
    
    const clampedValue = Math.max(0, Math.min(1, value));
    wavesurfer.setVolume(clampedValue);
    setVolume(clampedValue);
  }, [wavesurfer]);

  // Set the playback rate (0.5-2)
  const setAudioPlaybackRate = useCallback((rate: number) => {
    if (!wavesurfer) return;
    
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    wavesurfer.setPlaybackRate(clampedRate);
    setPlaybackRate(clampedRate);
  }, [wavesurfer]);

  return {
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    duration,
    togglePlayback,
    stopPlayback,
    seekTo,
    seek,
    seekForward,
    seekBackward,
    setAudioVolume,
    setAudioPlaybackRate,
  };
}
