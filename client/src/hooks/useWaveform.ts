import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export interface WaveformOptions {
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  barGap?: number;
  height?: number;
  barRadius?: number;
  normalize?: boolean;
  pixelRatio?: number;
  autoCenter?: boolean;
  fillParent?: boolean;
  minPxPerSec?: number;
  hideScrollbar?: boolean;
}

export function useWaveform(
  containerRef: React.RefObject<HTMLElement>,
  audioUrl: string | null | undefined,
  options?: WaveformOptions
) {
  const [waveform, setWaveform] = useState<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Keep track of the audio URL to avoid recreating the waveform for the same URL
  const audioUrlRef = useRef<string | null | undefined>(null);
  
  useEffect(() => {
    // Only create a new waveform if the container exists and the component is mounted
    if (!containerRef.current) return;
    
    // If we already have a waveform instance and the URL hasn't changed, do nothing
    if (waveform && audioUrl === audioUrlRef.current) return;
    
    // Update the ref with the new URL
    audioUrlRef.current = audioUrl;
    
    // Default options
    const defaultOptions = {
      container: containerRef.current,
      waveColor: '#6366F1',
      progressColor: '#4F46E5',
      cursorColor: 'rgba(255, 255, 255, 0.5)',
      barWidth: 2,
      barGap: 1,
      height: 80,
      barRadius: 2,
      normalize: true,
      pixelRatio: window.devicePixelRatio,
      autoCenter: true,
      fillParent: true,
      hideScrollbar: true,
    };
    
    // Create a new waveform instance
    const wavesurferInstance = WaveSurfer.create({
      ...defaultOptions,
      ...options,
    });
    
    // Set up event listeners
    wavesurferInstance.on('ready', () => {
      setIsReady(true);
      setIsLoading(false);
    });
    
    wavesurferInstance.on('error', (err) => {
      setError(err);
      setIsLoading(false);
    });
    
    // Load audio if URL is provided
    if (audioUrl) {
      setIsLoading(true);
      setIsReady(false);
      wavesurferInstance.load(audioUrl);
    } else {
      // If no audio, just render an empty waveform
      setIsReady(true);
    }
    
    // Store the waveform instance
    setWaveform(wavesurferInstance);
    
    // Clean up on unmount
    return () => {
      wavesurferInstance.destroy();
    };
  }, [containerRef, options]);
  
  // Handle audio URL changes
  useEffect(() => {
    if (!waveform) return;
    
    // If the URL has changed, load the new audio
    if (audioUrl !== audioUrlRef.current) {
      audioUrlRef.current = audioUrl;
      
      if (audioUrl) {
        setIsLoading(true);
        setIsReady(false);
        setError(null);
        waveform.load(audioUrl);
      } else {
        // If URL is removed, empty the waveform
        waveform.empty();
        setIsReady(true);
        setIsLoading(false);
      }
    }
  }, [audioUrl, waveform]);
  
  return {
    waveform,
    isReady,
    isLoading,
    error,
  };
}
