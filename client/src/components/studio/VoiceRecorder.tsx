import React, { useState, useRef, useCallback, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import { Button } from '@/components/ui/button';
import { MicIcon, StopIcon, TrashIcon, SaveIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createWaveformPath, normalizeAmplitudes } from '@/lib/audio-processing';

interface VoiceRecorderProps {
  onSaveRecording: (audioBlob: Blob) => void;
  maxRecordingTime?: number; // in milliseconds
}

export default function VoiceRecorder({ 
  onSaveRecording, 
  maxRecordingTime = 30000 // 30 seconds default
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [waveformPath, setWaveformPath] = useState<string>('');
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  
  const recorder = useRef<RecordRTC | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  // Set up audio analyser for waveform visualization
  const setupAudioAnalyser = useCallback((mediaStream: MediaStream) => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    analyser.current = audioContext.current.createAnalyser();
    analyser.current.fftSize = 256;
    
    const source = audioContext.current.createMediaStreamSource(mediaStream);
    source.connect(analyser.current);
    
    // Don't connect to destination to avoid feedback
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setupAudioAnalyser(stream.current);
      
      recorder.current = new RecordRTC(stream.current, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        bufferSize: 16384,
      });
      
      recorder.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioURL(null);
      setWaveformPath('');
      setAmplitudes([]);
      
      // Timer to track recording duration
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        setRecordingTime(elapsed);
        
        // Auto-stop if max time reached
        if (elapsed >= maxRecordingTime) {
          stopRecording();
        }
      }, 100);
      
      // Animation frame for waveform
      const updateWaveform = () => {
        if (analyser.current && isRecording) {
          const bufferLength = analyser.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.current.getByteTimeDomainData(dataArray);
          
          const amplitude = Array.from(dataArray).map(val => (val - 128) / 128);
          setAmplitudes(prevAmplitudes => [...prevAmplitudes, Math.max(...amplitude.map(Math.abs))]);
          
          const normalizedAmplitudes = normalizeAmplitudes(
            amplitudes.length > 100 ? amplitudes.slice(-100) : amplitudes
          );
          
          setWaveformPath(createWaveformPath(normalizedAmplitudes, 80));
          
          animationRef.current = requestAnimationFrame(updateWaveform);
        }
      };
      
      animationRef.current = requestAnimationFrame(updateWaveform);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [isRecording, amplitudes, maxRecordingTime, setupAudioAnalyser, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recorder.current && isRecording) {
      recorder.current.stopRecording(() => {
        const blob = recorder.current!.getBlob();
        setAudioURL(URL.createObjectURL(blob));
        setIsRecording(false);
        
        // Clear timers and animation frames
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        
        // Release media stream
        if (stream.current) {
          stream.current.getTracks().forEach(track => track.stop());
          stream.current = null;
        }
      });
    }
  }, [isRecording]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  // Format time for display (mm:ss)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset recording
  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
    setWaveformPath('');
    setAmplitudes([]);
  };

  // Save recording
  const saveRecording = () => {
    if (recorder.current && !isRecording) {
      const blob = recorder.current.getBlob();
      onSaveRecording(blob);
      
      toast({
        title: 'Success',
        description: 'Recording saved successfully!',
        variant: 'default',
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full rounded-lg bg-card p-4 border shadow-sm">
      <div className="w-full h-24 mb-4 bg-background rounded-md p-2 flex items-center justify-center relative overflow-hidden">
        {waveformPath ? (
          <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none">
            <path
              d={waveformPath}
              stroke={isRecording ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        ) : (
          <div className="text-muted-foreground text-sm">
            {audioURL ? 'Recording complete' : 'Press record to start'}
          </div>
        )}
      </div>
      
      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
        </div>
        
        {audioURL && (
          <audio controls src={audioURL} className="w-3/4 h-10" />
        )}
      </div>
      
      <div className="flex gap-2 w-full justify-center">
        {!isRecording && !audioURL && (
          <Button 
            onClick={startRecording} 
            variant="default"
            className="gap-2"
          >
            <MicIcon size={16} />
            Record
          </Button>
        )}
        
        {isRecording && (
          <Button 
            onClick={stopRecording} 
            variant="destructive"
            className="gap-2"
          >
            <StopIcon size={16} />
            Stop
          </Button>
        )}
        
        {audioURL && (
          <>
            <Button 
              onClick={resetRecording} 
              variant="outline"
              className="gap-2"
            >
              <TrashIcon size={16} />
              Discard
            </Button>
            
            <Button 
              onClick={saveRecording} 
              variant="default"
              className="gap-2"
            >
              <SaveIcon size={16} />
              Save Sample
            </Button>
          </>
        )}
      </div>
    </div>
  );
}