import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  SkipBack,
  Volume2,
  Music,
  Mic,
  BarChart3,
  Download,
  RefreshCw,
  Waveform,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWaveform } from '@/hooks/useWaveform';

interface AudioTrack {
  id: string;
  name: string;
  type: 'vocal' | 'instrumental' | 'mixed';
  url: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;
  effects: {
    reverb: {
      enabled: boolean;
      decay: number;
      wet: number;
    };
    delay: {
      enabled: boolean;
      time: number;
      feedback: number;
      wet: number;
    };
    eq: {
      enabled: boolean;
      low: number;
      mid: number;
      high: number;
    }
    compressor: {
      enabled: boolean;
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
    }
  };
}

interface AudioMixerProps {
  vocalTrack?: string;
  instrumentalTrack?: string;
  onSaveMix?: (mixedAudioUrl: string) => void;
}

export default function AudioMixer({ vocalTrack, instrumentalTrack, onSaveMix }: AudioMixerProps) {
  const { toast } = useToast();
  const waveformRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('mixer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [masterVolume, setMasterVolume] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  // Tone.js references
  const playerRefs = useRef<Map<string, Tone.Player>>(new Map());
  const effectRefs = useRef<Map<string, {
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
    eq: Tone.EQ3;
    compressor: Tone.Compressor;
  }>>(new Map());
  const channelRefs = useRef<Map<string, Tone.Channel>>(new Map());
  const masterRef = useRef<Tone.Volume | null>(null);
  
  // Waveform visualization
  const { waveform, initializeWaveform, updateWaveform } = useWaveform({
    waveColor: '#4f46e5',
    progressColor: '#818cf8',
    cursorColor: '#ffffff',
    height: 100,
    barWidth: 2,
    barGap: 1,
  });

  // Initialize the mixer with tracks
  useEffect(() => {
    // Clean up any existing tracks
    cleanupTracks();
    
    const newTracks: AudioTrack[] = [];
    
    // Add vocal track if provided
    if (vocalTrack) {
      newTracks.push({
        id: 'vocals',
        name: 'Vocals',
        type: 'vocal',
        url: vocalTrack,
        volume: -6,
        muted: false,
        solo: false,
        pan: 0,
        effects: {
          reverb: { enabled: false, decay: 1.5, wet: 0.2 },
          delay: { enabled: false, time: 0.25, feedback: 0.4, wet: 0.2 },
          eq: { enabled: true, low: 0, mid: 0, high: 0 },
          compressor: { enabled: true, threshold: -20, ratio: 4, attack: 0.01, release: 0.1 }
        }
      });
    }
    
    // Add instrumental track if provided
    if (instrumentalTrack) {
      newTracks.push({
        id: 'instrumental',
        name: 'Instrumental',
        type: 'instrumental',
        url: instrumentalTrack,
        volume: -8,
        muted: false,
        solo: false,
        pan: 0,
        effects: {
          reverb: { enabled: false, decay: 1.5, wet: 0.1 },
          delay: { enabled: false, time: 0.25, feedback: 0.2, wet: 0.15 },
          eq: { enabled: true, low: 0, mid: 0, high: 0 },
          compressor: { enabled: false, threshold: -20, ratio: 3, attack: 0.02, release: 0.2 }
        }
      });
    }
    
    setTracks(newTracks);
    setMasterVolume(0);
    
    // Set default selected track
    if (newTracks.length > 0) {
      setSelectedTrackId(newTracks[0].id);
    }
    
    // Initialize Tone.js
    if (!Tone.Transport.state) {
      Tone.start();
    }
    
    // Create master volume control
    masterRef.current = new Tone.Volume(0).toDestination();
    
    // Set up tracks
    setupTracks(newTracks);
    
    // Initialize waveform for the first track that exists
    if (vocalTrack) {
      initializeWaveformForTrack(vocalTrack);
    } else if (instrumentalTrack) {
      initializeWaveformForTrack(instrumentalTrack);
    }
    
    return () => {
      cleanupTracks();
    };
  }, [vocalTrack, instrumentalTrack]);
  
  // Initialize waveform for a specific track
  const initializeWaveformForTrack = async (url: string) => {
    if (waveformRef.current && typeof url === 'string') {
      try {
        if (!waveform) {
          await initializeWaveform(waveformRef.current);
        }
        
        updateWaveform(url);
      } catch (error) {
        console.error('Error initializing waveform:', error);
      }
    }
  };
  
  // Set up Tone.js players and effects for tracks
  const setupTracks = (tracksToSetup: AudioTrack[]) => {
    tracksToSetup.forEach(track => {
      // Create the effects chain
      const reverb = new Tone.Reverb({
        decay: track.effects.reverb.decay,
        wet: track.effects.reverb.enabled ? track.effects.reverb.wet : 0
      });
      
      const delay = new Tone.FeedbackDelay({
        delayTime: track.effects.delay.time,
        feedback: track.effects.delay.feedback,
        wet: track.effects.delay.enabled ? track.effects.delay.wet : 0
      });
      
      const eq = new Tone.EQ3({
        low: track.effects.eq.low,
        mid: track.effects.eq.mid,
        high: track.effects.eq.high
      });
      
      const compressor = new Tone.Compressor({
        threshold: track.effects.compressor.threshold,
        ratio: track.effects.compressor.ratio,
        attack: track.effects.compressor.attack,
        release: track.effects.compressor.release
      });
      
      // Create channel (for volume, pan, solo, mute)
      const channel = new Tone.Channel({
        volume: track.volume,
        pan: track.pan,
        mute: track.muted,
        solo: track.solo
      }).connect(masterRef.current!);
      
      // Create player and connect through effects chain
      const player = new Tone.Player({
        url: track.url,
        onload: () => {
          if (player.loaded) {
            setDuration(player.buffer.duration);
          }
        }
      });
      
      // Connect everything in the chain
      if (track.effects.eq.enabled) {
        player.chain(eq, channel);
      } else {
        player.connect(channel);
      }
      
      if (track.effects.compressor.enabled) {
        eq.disconnect();
        eq.chain(compressor, channel);
      }
      
      if (track.effects.reverb.enabled) {
        (track.effects.compressor.enabled ? compressor : eq).disconnect();
        (track.effects.compressor.enabled ? compressor : eq).chain(reverb, channel);
      }
      
      if (track.effects.delay.enabled) {
        (track.effects.reverb.enabled ? reverb : 
          track.effects.compressor.enabled ? compressor : eq).disconnect();
        (track.effects.reverb.enabled ? reverb : 
          track.effects.compressor.enabled ? compressor : eq).chain(delay, channel);
      }
      
      // Store references
      playerRefs.current.set(track.id, player);
      channelRefs.current.set(track.id, channel);
      effectRefs.current.set(track.id, { reverb, delay, eq, compressor });
    });
  };
  
  // Clean up all Tone.js instances
  const cleanupTracks = () => {
    // Dispose players
    playerRefs.current.forEach(player => {
      player.stop();
      player.dispose();
    });
    playerRefs.current.clear();
    
    // Dispose effects
    effectRefs.current.forEach(effects => {
      effects.reverb.dispose();
      effects.delay.dispose();
      effects.eq.dispose();
      effects.compressor.dispose();
    });
    effectRefs.current.clear();
    
    // Dispose channels
    channelRefs.current.forEach(channel => {
      channel.dispose();
    });
    channelRefs.current.clear();
    
    // Dispose master volume
    if (masterRef.current) {
      masterRef.current.dispose();
      masterRef.current = null;
    }
  };
  
  // Handle play/pause
  const togglePlayback = () => {
    if (!isPlaying) {
      // Start playing all tracks
      Tone.Transport.start();
      playerRefs.current.forEach(player => {
        player.start();
      });
      setIsPlaying(true);
      
      // Update current time during playback
      const interval = setInterval(() => {
        if (playerRefs.current.size > 0) {
          const firstPlayer = playerRefs.current.values().next().value;
          if (firstPlayer) {
            setCurrentTime(firstPlayer.context.currentTime % duration);
          }
        }
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      // Pause all tracks
      Tone.Transport.pause();
      playerRefs.current.forEach(player => {
        player.stop();
      });
      setIsPlaying(false);
    }
  };
  
  // Reset playback to beginning
  const resetPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  // Update master volume
  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.volume.value = masterVolume;
    }
  }, [masterVolume]);
  
  // Handle changes to track volume
  const handleVolumeChange = (trackId: string, value: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume: value } : track
    ));
    
    const channel = channelRefs.current.get(trackId);
    if (channel) {
      channel.volume.value = value;
    }
  };
  
  // Handle changes to track pan
  const handlePanChange = (trackId: string, value: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, pan: value } : track
    ));
    
    const channel = channelRefs.current.get(trackId);
    if (channel) {
      channel.pan.value = value;
    }
  };
  
  // Toggle track mute
  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
    
    const channel = channelRefs.current.get(trackId);
    if (channel) {
      channel.mute = !channel.mute;
    }
  };
  
  // Toggle track solo
  const toggleSolo = (trackId: string) => {
    setTracks(prev => {
      const updatedTracks = prev.map(track => 
        track.id === trackId ? { ...track, solo: !track.solo } : track
      );
      
      // Update channel solo states
      updatedTracks.forEach(track => {
        const channel = channelRefs.current.get(track.id);
        if (channel) {
          channel.solo = track.solo;
        }
      });
      
      return updatedTracks;
    });
  };
  
  // Toggle effect enabled status
  const toggleEffect = (trackId: string, effectType: keyof AudioTrack['effects']) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const updatedEffects = { ...track.effects };
        updatedEffects[effectType].enabled = !updatedEffects[effectType].enabled;
        
        // Apply changes to the actual effects
        const effects = effectRefs.current.get(trackId);
        const player = playerRefs.current.get(trackId);
        const channel = channelRefs.current.get(trackId);
        
        if (effects && player && channel) {
          // For simplicity, recreate the chain when toggling effects
          player.disconnect();
          effects.eq.disconnect();
          effects.compressor.disconnect();
          effects.reverb.disconnect();
          effects.delay.disconnect();
          
          // Build the new chain based on enabled effects
          let lastEffect: Tone.ToneAudioNode = player;
          
          if (updatedEffects.eq.enabled) {
            player.connect(effects.eq);
            lastEffect = effects.eq;
          }
          
          if (updatedEffects.compressor.enabled) {
            if (lastEffect !== player) {
              lastEffect.connect(effects.compressor);
            } else {
              player.connect(effects.compressor);
            }
            lastEffect = effects.compressor;
          }
          
          if (updatedEffects.reverb.enabled) {
            effects.reverb.wet.value = updatedEffects.reverb.wet;
            if (lastEffect !== player) {
              lastEffect.connect(effects.reverb);
            } else {
              player.connect(effects.reverb);
            }
            lastEffect = effects.reverb;
          }
          
          if (updatedEffects.delay.enabled) {
            effects.delay.wet.value = updatedEffects.delay.wet;
            if (lastEffect !== player) {
              lastEffect.connect(effects.delay);
            } else {
              player.connect(effects.delay);
            }
            lastEffect = effects.delay;
          }
          
          // Connect the last effect to the channel
          lastEffect.connect(channel);
        }
        
        return { ...track, effects: updatedEffects };
      }
      return track;
    }));
  };
  
  // Change effect parameter
  const updateEffectParam = (
    trackId: string, 
    effectType: keyof AudioTrack['effects'], 
    paramName: string, 
    value: number
  ) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const updatedEffects = { ...track.effects };
        // Update the parameter value
        (updatedEffects[effectType] as any)[paramName] = value;
        
        // Apply changes to the actual effect
        const effects = effectRefs.current.get(trackId);
        
        if (effects) {
          const effect = effects[effectType as keyof typeof effects];
          
          // Handle different effect types and their parameters
          if (effectType === 'reverb') {
            if (paramName === 'decay') {
              // Can't update reverb decay dynamically, would need to recreate
              // Just store the value for now
            } else if (paramName === 'wet') {
              (effect as Tone.Reverb).wet.value = value;
            }
          } else if (effectType === 'delay') {
            if (paramName === 'time') {
              (effect as Tone.FeedbackDelay).delayTime.value = value;
            } else if (paramName === 'feedback') {
              (effect as Tone.FeedbackDelay).feedback.value = value;
            } else if (paramName === 'wet') {
              (effect as Tone.FeedbackDelay).wet.value = value;
            }
          } else if (effectType === 'eq') {
            if (paramName === 'low') {
              (effect as Tone.EQ3).low.value = value;
            } else if (paramName === 'mid') {
              (effect as Tone.EQ3).mid.value = value;
            } else if (paramName === 'high') {
              (effect as Tone.EQ3).high.value = value;
            }
          } else if (effectType === 'compressor') {
            if (paramName === 'threshold') {
              (effect as Tone.Compressor).threshold.value = value;
            } else if (paramName === 'ratio') {
              (effect as Tone.Compressor).ratio.value = value;
            } else if (paramName === 'attack') {
              (effect as Tone.Compressor).attack.value = value;
            } else if (paramName === 'release') {
              (effect as Tone.Compressor).release.value = value;
            }
          }
        }
        
        return { ...track, effects: updatedEffects };
      }
      return track;
    }));
  };
  
  // Mix down and export
  const renderMixdown = async () => {
    setIsRendering(true);
    
    try {
      // Stop any playback
      resetPlayback();
      
      // Create an offline context for rendering
      const offlineContext = new Tone.OfflineContext(2, duration, 44100);
      
      // Create a temporary master output
      const master = new Tone.Volume(masterVolume).toDestination();
      
      // Setup all tracks in the offline context
      const offlinePlayers = new Map();
      const offlineEffects = new Map();
      const offlineChannels = new Map();
      
      for (const track of tracks) {
        // Load and buffer the audio for offline processing
        const buffer = await Tone.Buffer.fromUrl(track.url);
        
        // Create offline player
        const player = new Tone.Player({
          url: '',
          context: offlineContext
        }).set({ buffer });
        
        // Create effect chain similar to setupTracks
        const reverb = new Tone.Reverb({
          decay: track.effects.reverb.decay,
          wet: track.effects.reverb.enabled ? track.effects.reverb.wet : 0,
          context: offlineContext
        });
        
        const delay = new Tone.FeedbackDelay({
          delayTime: track.effects.delay.time,
          feedback: track.effects.delay.feedback,
          wet: track.effects.delay.enabled ? track.effects.delay.wet : 0,
          context: offlineContext
        });
        
        const eq = new Tone.EQ3({
          low: track.effects.eq.low,
          mid: track.effects.eq.mid,
          high: track.effects.eq.high,
          context: offlineContext
        });
        
        const compressor = new Tone.Compressor({
          threshold: track.effects.compressor.threshold,
          ratio: track.effects.compressor.ratio,
          attack: track.effects.compressor.attack,
          release: track.effects.compressor.release,
          context: offlineContext
        });
        
        // Create channel
        const channel = new Tone.Channel({
          volume: track.volume,
          pan: track.pan,
          mute: track.muted,
          solo: track.solo,
          context: offlineContext
        }).connect(master);
        
        // Connect everything in the chain
        // (Similar logic to setupTracks but for offline context)
        
        // Connect player through enabled effects
        let lastNode: Tone.ToneAudioNode = player;
        
        if (track.effects.eq.enabled) {
          player.connect(eq);
          lastNode = eq;
        }
        
        if (track.effects.compressor.enabled) {
          lastNode.connect(compressor);
          lastNode = compressor;
        }
        
        if (track.effects.reverb.enabled) {
          lastNode.connect(reverb);
          lastNode = reverb;
        }
        
        if (track.effects.delay.enabled) {
          lastNode.connect(delay);
          lastNode = delay;
        }
        
        // Connect final node to channel
        lastNode.connect(channel);
        
        // Store references
        offlinePlayers.set(track.id, player);
        offlineEffects.set(track.id, { reverb, delay, eq, compressor });
        offlineChannels.set(track.id, channel);
      }
      
      // Playback all tracks at time 0
      offlinePlayers.forEach(player => {
        player.start(0);
      });
      
      // Render audio
      const renderedBuffer = await offlineContext.render();
      
      // Convert AudioBuffer to WAV format
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      // Create downloadable URL
      const mixUrl = URL.createObjectURL(wavBlob);
      
      // Callback with the mixed audio URL
      if (onSaveMix) {
        onSaveMix(mixUrl);
      }
      
      // Offer immediate download
      const downloadLink = document.createElement('a');
      downloadLink.href = mixUrl;
      downloadLink.download = 'mixed-track.wav';
      downloadLink.click();
      
      toast({
        title: 'Mix Rendered Successfully',
        description: 'Your mixed audio has been processed and downloaded.',
      });
      
      // Clean up offline resources
      offlinePlayers.forEach(player => player.dispose());
      offlineEffects.forEach(effects => {
        effects.reverb.dispose();
        effects.delay.dispose();
        effects.eq.dispose();
        effects.compressor.dispose();
      });
      offlineChannels.forEach(channel => channel.dispose());
      master.dispose();
      
    } catch (error) {
      console.error('Error rendering mixdown:', error);
      toast({
        title: 'Mix Rendering Failed',
        description: 'There was an error processing your audio mix.',
        variant: 'destructive'
      });
    } finally {
      setIsRendering(false);
    }
  };
  
  // Helper to convert AudioBuffer to WAV file
  // This is a simplified version - a real implementation would use a proper library
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    // Placeholder implementation
    const encodedBuffer = encodeWAV(buffer);
    return new Blob([encodedBuffer], { type: 'audio/wav' });
  };
  
  // Simplified WAV encoder (would use a proper library in production)
  const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    // Extract raw audio data
    const channelData = [];
    for (let i = 0; i < numOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
    
    // Interleave the channel data and convert to 16-bit PCM
    const interleaved = interleaveChannels(channelData, audioBuffer.length);
    const dataView = encodeAsPCM(interleaved, bitDepth);
    
    // Create WAV header
    const header = createWAVHeader({
      numOfChannels,
      sampleRate,
      bitDepth,
      dataLength: dataView.byteLength
    });
    
    // Combine header and data
    const wavBuffer = new ArrayBuffer(header.byteLength + dataView.byteLength);
    const output = new Uint8Array(wavBuffer);
    output.set(new Uint8Array(header), 0);
    output.set(new Uint8Array(dataView.buffer), header.byteLength);
    
    return wavBuffer;
  };
  
  // Interleave multiple audio channels
  const interleaveChannels = (channelsData: Float32Array[], frameCount: number): Float32Array => {
    const numOfChannels = channelsData.length;
    const result = new Float32Array(frameCount * numOfChannels);
    
    for (let i = 0; i < frameCount; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        result[i * numOfChannels + channel] = channelsData[channel][i];
      }
    }
    
    return result;
  };
  
  // Convert Float32Array to PCM
  const encodeAsPCM = (samples: Float32Array, bitDepth: number): DataView => {
    const bytesPerSample = bitDepth / 8;
    const buffer = new ArrayBuffer(samples.length * bytesPerSample);
    const view = new DataView(buffer);
    
    let offset = 0;
    for (let i = 0; i < samples.length; i++) {
      // Clamp value between -1 and 1
      const sample = Math.max(-1, Math.min(1, samples[i]));
      
      // Scale to appropriate bit depth
      const value = sample < 0 
        ? sample * 32768 
        : sample * 32767;
      
      // Write sample to buffer
      view.setInt16(offset, value, true);
      offset += bytesPerSample;
    }
    
    return view;
  };
  
  // Create WAV header
  const createWAVHeader = ({
    numOfChannels,
    sampleRate,
    bitDepth,
    dataLength
  }: {
    numOfChannels: number;
    sampleRate: number;
    bitDepth: number;
    dataLength: number;
  }): ArrayBuffer => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + dataLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (PCM)
    view.setUint16(20, 1, true);
    // Channel count
    view.setUint16(22, numOfChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, numOfChannels * (bitDepth / 8), true);
    // Bits per sample
    view.setUint16(34, bitDepth, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, dataLength, true);
    
    return buffer;
  };
  
  // Helper to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Format time display (MM:SS.ss)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // Get the selected track for the effects panel
  const selectedTrack = tracks.find(track => track.id === selectedTrackId);
  
  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {/* Waveform display */}
          <div ref={waveformRef} className="w-full h-[100px] bg-muted"></div>
          
          {/* Transport controls and time display */}
          <div className="flex justify-between items-center p-3 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={resetPlayback}>
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant={isPlaying ? "secondary" : "default"} 
                className="w-24"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <><Pause className="h-4 w-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Play</>
                )}
              </Button>
            </div>
            
            <div className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider 
                  className="w-24" 
                  min={-60} 
                  max={6} 
                  step={0.5}
                  value={[masterVolume]}
                  onValueChange={([value]) => setMasterVolume(value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={renderMixdown}
                disabled={isRendering || tracks.length === 0}
              >
                {isRendering ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Rendering...</>
                ) : (
                  <><Download className="h-4 w-4" /> Export</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="mixer" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Mixer
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> Effects
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mixer" className="space-y-4">
          {/* Track mixer interface */}
          <div className="grid grid-cols-1 gap-3">
            {tracks.map(track => (
              <Card 
                key={track.id} 
                className={`cursor-pointer ${selectedTrackId === track.id ? 'ring-1 ring-primary' : ''}`}
                onClick={() => setSelectedTrackId(track.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {track.type === 'vocal' ? (
                        <Mic className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Music className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-medium">{track.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={track.muted ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(track.id);
                        }}
                      >
                        M
                      </Button>
                      
                      <Button
                        variant={track.solo ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolo(track.id);
                        }}
                      >
                        S
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Volume ({track.volume} dB)</Label>
                      <Slider
                        min={-60}
                        max={6}
                        step={0.5}
                        value={[track.volume]}
                        onValueChange={([value]) => handleVolumeChange(track.id, value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Pan ({track.pan.toFixed(2)})</Label>
                      <Slider
                        min={-1}
                        max={1}
                        step={0.01}
                        value={[track.pan]}
                        onValueChange={([value]) => handlePanChange(track.id, value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="space-y-4">
          {selectedTrack ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Effects for {selectedTrack.name}</h3>
                <Select
                  value={selectedTrackId || ''}
                  onValueChange={(value) => setSelectedTrackId(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map(track => (
                      <SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              {/* EQ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Equalizer</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="eq-toggle">Enabled</Label>
                    <Switch
                      id="eq-toggle"
                      checked={selectedTrack.effects.eq.enabled}
                      onCheckedChange={() => toggleEffect(selectedTrack.id, 'eq')}
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-3 gap-4 ${!selectedTrack.effects.eq.enabled ? 'opacity-50' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-xs">Low ({selectedTrack.effects.eq.low} dB)</Label>
                    <Slider
                      min={-12}
                      max={12}
                      step={0.5}
                      disabled={!selectedTrack.effects.eq.enabled}
                      value={[selectedTrack.effects.eq.low]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'eq', 'low', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Mid ({selectedTrack.effects.eq.mid} dB)</Label>
                    <Slider
                      min={-12}
                      max={12}
                      step={0.5}
                      disabled={!selectedTrack.effects.eq.enabled}
                      value={[selectedTrack.effects.eq.mid]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'eq', 'mid', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">High ({selectedTrack.effects.eq.high} dB)</Label>
                    <Slider
                      min={-12}
                      max={12}
                      step={0.5}
                      disabled={!selectedTrack.effects.eq.enabled}
                      value={[selectedTrack.effects.eq.high]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'eq', 'high', value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Compressor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Compressor</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="compressor-toggle">Enabled</Label>
                    <Switch
                      id="compressor-toggle"
                      checked={selectedTrack.effects.compressor.enabled}
                      onCheckedChange={() => toggleEffect(selectedTrack.id, 'compressor')}
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-4 ${!selectedTrack.effects.compressor.enabled ? 'opacity-50' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-xs">Threshold ({selectedTrack.effects.compressor.threshold} dB)</Label>
                    <Slider
                      min={-60}
                      max={0}
                      step={1}
                      disabled={!selectedTrack.effects.compressor.enabled}
                      value={[selectedTrack.effects.compressor.threshold]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'compressor', 'threshold', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Ratio ({selectedTrack.effects.compressor.ratio}:1)</Label>
                    <Slider
                      min={1}
                      max={20}
                      step={0.5}
                      disabled={!selectedTrack.effects.compressor.enabled}
                      value={[selectedTrack.effects.compressor.ratio]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'compressor', 'ratio', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Attack ({selectedTrack.effects.compressor.attack.toFixed(3)} s)</Label>
                    <Slider
                      min={0.001}
                      max={1}
                      step={0.001}
                      disabled={!selectedTrack.effects.compressor.enabled}
                      value={[selectedTrack.effects.compressor.attack]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'compressor', 'attack', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Release ({selectedTrack.effects.compressor.release.toFixed(2)} s)</Label>
                    <Slider
                      min={0.01}
                      max={2}
                      step={0.01}
                      disabled={!selectedTrack.effects.compressor.enabled}
                      value={[selectedTrack.effects.compressor.release]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'compressor', 'release', value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Reverb */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Reverb</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reverb-toggle">Enabled</Label>
                    <Switch
                      id="reverb-toggle"
                      checked={selectedTrack.effects.reverb.enabled}
                      onCheckedChange={() => toggleEffect(selectedTrack.id, 'reverb')}
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-4 ${!selectedTrack.effects.reverb.enabled ? 'opacity-50' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-xs">Decay ({selectedTrack.effects.reverb.decay.toFixed(1)} s)</Label>
                    <Slider
                      min={0.1}
                      max={10}
                      step={0.1}
                      disabled={!selectedTrack.effects.reverb.enabled}
                      value={[selectedTrack.effects.reverb.decay]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'reverb', 'decay', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Mix ({Math.round(selectedTrack.effects.reverb.wet * 100)}%)</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      disabled={!selectedTrack.effects.reverb.enabled}
                      value={[selectedTrack.effects.reverb.wet]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'reverb', 'wet', value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Delay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Delay</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="delay-toggle">Enabled</Label>
                    <Switch
                      id="delay-toggle"
                      checked={selectedTrack.effects.delay.enabled}
                      onCheckedChange={() => toggleEffect(selectedTrack.id, 'delay')}
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-3 gap-4 ${!selectedTrack.effects.delay.enabled ? 'opacity-50' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-xs">Time ({selectedTrack.effects.delay.time.toFixed(2)} s)</Label>
                    <Slider
                      min={0.01}
                      max={1}
                      step={0.01}
                      disabled={!selectedTrack.effects.delay.enabled}
                      value={[selectedTrack.effects.delay.time]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'delay', 'time', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Feedback ({Math.round(selectedTrack.effects.delay.feedback * 100)}%)</Label>
                    <Slider
                      min={0}
                      max={0.9}
                      step={0.01}
                      disabled={!selectedTrack.effects.delay.enabled}
                      value={[selectedTrack.effects.delay.feedback]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'delay', 'feedback', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Mix ({Math.round(selectedTrack.effects.delay.wet * 100)}%)</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      disabled={!selectedTrack.effects.delay.enabled}
                      value={[selectedTrack.effects.delay.wet]}
                      onValueChange={([value]) => updateEffectParam(selectedTrack.id, 'delay', 'wet', value)}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">No Track Selected</h3>
              <p className="text-muted-foreground">
                Select a track from the mixer to edit its effects.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}