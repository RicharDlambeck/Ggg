import { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  audioUrl?: string;
  waveformData?: number[];
  height?: number;
  waveColor?: string;
  progressColor?: string;
  isVocal?: boolean;
  currentTime?: number;
  duration?: number;
  onPositionChange?: (position: number) => void;
  playing?: boolean;
}

export function Waveform({
  audioUrl,
  waveformData,
  height = 80,
  waveColor = 'rgba(139, 92, 246, 0.7)',
  progressColor = 'rgba(139, 92, 246, 1)',
  isVocal = false,
  currentTime = 0,
  duration = 0,
  onPositionChange,
  playing = false
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Colors for vocal tracks
  const vocalWaveColor = 'rgba(79, 70, 229, 0.7)';
  const vocalProgressColor = 'rgba(79, 70, 229, 1)';

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Dispose of previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    const options = {
      container: containerRef.current,
      height: height,
      waveColor: isVocal ? vocalWaveColor : waveColor,
      progressColor: isVocal ? vocalProgressColor : progressColor,
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      backend: 'WebAudio'
    };
    
    wavesurferRef.current = WaveSurfer.create(options);
    
    // If we have audio URL, load it
    if (audioUrl) {
      wavesurferRef.current.load(audioUrl);
    } 
    // Otherwise if we have waveform data, use it
    else if (waveformData && waveformData.length > 0) {
      // Convert waveform data to peaks format expected by WaveSurfer
      const peaks = [...waveformData.map(val => val / 100), ...waveformData.map(val => -val / 100)];
      wavesurferRef.current.loadDecodedBuffer(createAudioBuffer(peaks));
    }
    
    wavesurferRef.current.on('ready', () => {
      setIsReady(true);
    });
    
    wavesurferRef.current.on('click', (pos) => {
      if (onPositionChange) {
        onPositionChange(pos);
      }
    });
    
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, waveformData, height, waveColor, progressColor, isVocal]);
  
  // Handle play/pause
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    
    if (playing) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [playing, isReady]);
  
  // Handle seek position
  useEffect(() => {
    if (!wavesurferRef.current || !isReady || !duration) return;
    
    const position = currentTime / duration;
    wavesurferRef.current.seekTo(position);
  }, [currentTime, duration, isReady]);
  
  // Helper function to create an audio buffer from peaks
  function createAudioBuffer(peaks: number[]): AudioBuffer {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, peaks.length, 44100);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < peaks.length; i++) {
      data[i] = peaks[i];
    }
    
    return buffer;
  }
  
  return (
    <div className={`waveform ${isVocal ? 'vocal-waveform' : ''}`} ref={containerRef}></div>
  );
}
