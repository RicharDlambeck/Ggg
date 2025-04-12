import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Volume2, // Replacing 'SpeakerLoud' with 'Volume2'
  Waves, 
  Voicemail, 
  Timer, 
  AreaChart, 
  Activity, // Replacing 'Waveform' with 'Activity'
  Download,
  Play,
  Pause,
  RotateCcw,
  Save,
  XCircle
} from 'lucide-react';
import * as Tone from 'tone';
import { useToast } from '@/hooks/use-toast';

interface AudioTrack {
  id: number;
  name: string;
  url: string;
  type: 'vocals' | 'instrumental' | 'mixed';
  volume: number;
  muted: boolean;
  soloed: boolean;
  effects: {
    reverb: number;
    delay: number;
    eq: {
      low: number;
      mid: number;
      high: number;
    };
    compression: number;
  };
}

interface MixPanelProps {
  vocalTrackUrl?: string | null;
  instrumentalTrackUrl?: string | null;
  onSaveTrack?: (mixedUrl: string) => void;
}

export default function MixPanel({ vocalTrackUrl, instrumentalTrackUrl, onSaveTrack }: MixPanelProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [currentTab, setCurrentTab] = useState<string>('mixer');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  const playerRefs = useRef<Record<number, Tone.Player>>({});
  const effectsRefs = useRef<Record<number, {
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
    eq: Tone.EQ3;
    compressor: Tone.Compressor;
  }>>({});
  const masterRef = useRef<Tone.Volume | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  // Initialize Tone.js and tracks
  useEffect(() => {
    // Initialize Tone.js
    const initTone = async () => {
      await Tone.start();
      masterRef.current = new Tone.Volume(Tone.gainToDb(masterVolume / 100)).toDestination();
      
      // Generate initial tracks
      const initialTracks: AudioTrack[] = [];
      
      if (instrumentalTrackUrl) {
        initialTracks.push({
          id: 1,
          name: 'Instrumental',
          url: instrumentalTrackUrl,
          type: 'instrumental',
          volume: 75,
          muted: false,
          soloed: false,
          effects: {
            reverb: 0,
            delay: 0,
            eq: { low: 0, mid: 0, high: 0 },
            compression: 0
          }
        });
      }
      
      if (vocalTrackUrl) {
        initialTracks.push({
          id: 2,
          name: 'Vocals',
          url: vocalTrackUrl,
          type: 'vocals',
          volume: 80,
          muted: false,
          soloed: false,
          effects: {
            reverb: 20,
            delay: 10,
            eq: { low: -3, mid: 0, high: 2 },
            compression: 25
          }
        });
      }
      
      if (initialTracks.length > 0) {
        setTracks(initialTracks);
        loadTracks(initialTracks);
      }
    };
    
    initTone();
    
    return () => {
      // Clean up
      Object.values(playerRefs.current).forEach(player => {
        player.stop();
        player.dispose();
      });
      
      Object.values(effectsRefs.current).forEach(effects => {
        effects.reverb.dispose();
        effects.delay.dispose();
        effects.eq.dispose();
        effects.compressor.dispose();
      });
      
      if (masterRef.current) {
        masterRef.current.dispose();
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vocalTrackUrl, instrumentalTrackUrl]);
  
  // Load audio tracks into Tone.js players
  const loadTracks = async (tracksToLoad: AudioTrack[]) => {
    await Promise.all(tracksToLoad.map(async (track) => {
      // Create effects chain
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: track.effects.reverb / 100
      }).toDestination();
      await reverb.generate();
      
      const delay = new Tone.FeedbackDelay({
        delayTime: 0.25,
        feedback: track.effects.delay / 100,
        wet: track.effects.delay > 0 ? 0.5 : 0
      }).connect(reverb);
      
      const eq = new Tone.EQ3({
        low: track.effects.eq.low,
        mid: track.effects.eq.mid,
        high: track.effects.eq.high
      }).connect(delay);
      
      const compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 1 + (track.effects.compression / 25),
        attack: 0.003,
        release: 0.25
      }).connect(eq);
      
      // Create player
      const player = new Tone.Player({
        url: track.url,
        onload: () => {
          setDuration(Math.max(duration, player.buffer.duration));
        }
      });
      
      // Set volume
      player.volume.value = Tone.gainToDb(track.volume / 100);
      
      // Connect player to effects chain
      player.connect(compressor);
      
      // Connect final effect to master volume
      reverb.connect(masterRef.current!);
      
      // Store refs
      playerRefs.current[track.id] = player;
      effectsRefs.current[track.id] = {
        reverb,
        delay,
        eq,
        compressor
      };
    }));
  };
  
  // Update effects when track parameters change
  useEffect(() => {
    tracks.forEach(track => {
      const player = playerRefs.current[track.id];
      const effects = effectsRefs.current[track.id];
      
      if (player && effects) {
        // Update volume
        player.volume.value = track.muted ? -Infinity : Tone.gainToDb(track.volume / 100);
        
        // Update effects
        effects.reverb.wet.value = track.effects.reverb / 100;
        effects.delay.feedback.value = track.effects.delay / 100;
        effects.delay.wet.value = track.effects.delay > 0 ? 0.5 : 0;
        effects.eq.low.value = track.effects.eq.low;
        effects.eq.mid.value = track.effects.eq.mid;
        effects.eq.high.value = track.effects.eq.high;
        effects.compressor.ratio.value = 1 + (track.effects.compression / 25);
      }
    });
    
    // Handle soloing logic
    const anySoloed = tracks.some(track => track.soloed);
    
    if (anySoloed) {
      tracks.forEach(track => {
        const player = playerRefs.current[track.id];
        if (player) {
          if (!track.soloed) {
            player.volume.value = -Infinity;
          }
        }
      });
    }
    
    // Update master volume
    if (masterRef.current) {
      masterRef.current.volume.value = Tone.gainToDb(masterVolume / 100);
    }
  }, [tracks, masterVolume]);
  
  // Play/pause all tracks
  const togglePlayback = async () => {
    // Initialize Tone.js if needed
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      // Pause all players
      Object.values(playerRefs.current).forEach(player => {
        player.stop();
      });
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      setIsPlaying(false);
    } else {
      // Calculate current time in seconds
      const currentSeconds = Tone.now();
      
      // Start all players
      Object.values(playerRefs.current).forEach(player => {
        player.start();
      });
      
      // Update time display with animation frame
      const updateTime = () => {
        const newTime = Tone.now() - currentSeconds;
        setCurrentTime(newTime);
        
        if (newTime < duration) {
          animationRef.current = requestAnimationFrame(updateTime);
        } else {
          stopPlayback();
        }
      };
      
      animationRef.current = requestAnimationFrame(updateTime);
      setIsPlaying(true);
    }
  };
  
  // Stop playback and reset time
  const stopPlayback = () => {
    // Stop all players
    Object.values(playerRefs.current).forEach(player => {
      player.stop();
    });
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  // Update track volume
  const handleVolumeChange = (trackId: number, value: number) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId 
          ? { ...track, volume: value }
          : track
      )
    );
  };
  
  // Toggle track mute
  const toggleMute = (trackId: number) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId
          ? { ...track, muted: !track.muted }
          : track
      )
    );
  };
  
  // Toggle track solo
  const toggleSolo = (trackId: number) => {
    setTracks(prevTracks => {
      const trackToUpdate = prevTracks.find(t => t.id === trackId);
      const newSoloState = trackToUpdate ? !trackToUpdate.soloed : false;
      
      return prevTracks.map(track => 
        track.id === trackId
          ? { ...track, soloed: newSoloState }
          : track
      );
    });
  };
  
  // Update effect parameters
  const handleEffectChange = (trackId: number, effect: string, value: number, subParam?: string) => {
    setTracks(prevTracks => 
      prevTracks.map(track => {
        if (track.id === trackId) {
          if (effect === 'eq' && subParam) {
            return {
              ...track,
              effects: {
                ...track.effects,
                eq: {
                  ...track.effects.eq,
                  [subParam]: value
                }
              }
            };
          } else {
            return {
              ...track,
              effects: {
                ...track.effects,
                [effect]: value
              }
            };
          }
        }
        return track;
      })
    );
  };
  
  // Add a new track
  const addTrack = (url: string, name: string, type: 'vocals' | 'instrumental' | 'mixed') => {
    const newTrack: AudioTrack = {
      id: Date.now(),
      name,
      url,
      type,
      volume: 75,
      muted: false,
      soloed: false,
      effects: {
        reverb: 0,
        delay: 0,
        eq: { low: 0, mid: 0, high: 0 },
        compression: 0
      }
    };
    
    setTracks(prevTracks => [...prevTracks, newTrack]);
    loadTracks([newTrack]);
  };
  
  // Remove a track
  const removeTrack = (trackId: number) => {
    const player = playerRefs.current[trackId];
    if (player) {
      player.stop();
      player.dispose();
      delete playerRefs.current[trackId];
    }
    
    const effects = effectsRefs.current[trackId];
    if (effects) {
      effects.reverb.dispose();
      effects.delay.dispose();
      effects.eq.dispose();
      effects.compressor.dispose();
      delete effectsRefs.current[trackId];
    }
    
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
  };
  
  // Export mixed audio
  const exportMix = async () => {
    setIsExporting(true);
    
    try {
      // Create an offline context to render audio
      const offlineContext = new Tone.OfflineContext(2, duration, 44100);
      
      // Recreate the audio graph in the offline context
      const offlineMaster = new Tone.Volume(Tone.gainToDb(masterVolume / 100)).toDestination();
      
      // Render each track with its effects
      await Promise.all(tracks.map(async (track) => {
        // Skip muted tracks
        if (track.muted) return;
        
        // Skip tracks that aren't soloed if any track is soloed
        const anySoloed = tracks.some(t => t.soloed);
        if (anySoloed && !track.soloed) return;
        
        // Create effects chain
        const reverb = new Tone.Reverb({
          decay: 1.5,
          wet: track.effects.reverb / 100
        }).toDestination();
        await reverb.generate();
        
        const delay = new Tone.FeedbackDelay({
          delayTime: 0.25,
          feedback: track.effects.delay / 100,
          wet: track.effects.delay > 0 ? 0.5 : 0
        }).connect(reverb);
        
        const eq = new Tone.EQ3({
          low: track.effects.eq.low,
          mid: track.effects.eq.mid,
          high: track.effects.eq.high
        }).connect(delay);
        
        const compressor = new Tone.Compressor({
          threshold: -24,
          ratio: 1 + (track.effects.compression / 25),
          attack: 0.003,
          release: 0.25
        }).connect(eq);
        
        // Create player
        const player = new Tone.Player({
          url: track.url,
          volume: Tone.gainToDb(track.volume / 100)
        });
        
        // Connect player to effects chain
        player.connect(compressor);
        
        // Connect final effect to master volume
        reverb.connect(offlineMaster);
        
        // Schedule player
        player.start(0);
      }));
      
      // Render audio
      const renderedBuffer = await offlineContext.render();
      
      // Convert to blob
      const blob = bufferToWav(renderedBuffer);
      
      // Create URL
      const mixedUrl = URL.createObjectURL(blob);
      
      // Return the URL or trigger download
      if (onSaveTrack) {
        onSaveTrack(mixedUrl);
      } else {
        const a = document.createElement('a');
        a.href = mixedUrl;
        a.download = 'mixed-track.wav';
        a.click();
      }
      
      toast({
        title: 'Export Successful',
        description: 'Your mixed track has been exported successfully!',
      });
    } catch (error) {
      console.error('Error exporting mix:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your mix.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Convert AudioBuffer to WAV blob
  const bufferToWav = (buffer: AudioBuffer): Blob => {
    // Get buffers (Float32Arrays)
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    
    // Create WAV header
    const header = createWavHeader(length, numberOfChannels, sampleRate);
    
    // Create buffer with header and audio data
    const audioData = new Float32Array(buffer.length * numberOfChannels);
    let offset = 0;
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        audioData[offset++] = channelData[i];
      }
    }
    
    // Create Int16Array from Float32Array
    const int16Array = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Create Blob from header and audio data
    return new Blob([header, new Uint8Array(int16Array.buffer)], { type: 'audio/wav' });
  };
  
  // Create WAV header
  const createWavHeader = (dataLength: number, numChannels: number, sampleRate: number): ArrayBuffer => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
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
    // Sample format (raw)
    view.setUint16(20, 1, true);
    // Channel count
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 4, true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * 2, true);
    // Bits per sample
    view.setUint16(34, 16, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, dataLength, true);
    
    return header;
  };
  
  // Write string to DataView
  const writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Format time for display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Transport controls */}
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={stopPlayback}
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <SpeakerLoud size={16} />
                <Slider
                  value={[masterVolume]}
                  min={0}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={(value) => setMasterVolume(value[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="mixer" className="flex items-center gap-1">
            <Waves size={16} />
            Mixer
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-1">
            <Activity size={16} />
            Effects
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mixer" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map(track => (
              <Card key={track.id} className={track.type === 'vocals' ? 'border-primary/30' : ''}>
                <CardHeader className="p-3 pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      {track.type === 'vocals' ? (
                        <Voicemail size={16} />
                      ) : (
                        <Waves size={16} />
                      )}
                      {track.name}
                    </CardTitle>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTrack(track.id)}
                    >
                      <XCircle size={14} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant={track.muted ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-12 ${track.muted ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        onClick={() => toggleMute(track.id)}
                      >
                        M
                      </Button>
                      
                      <Button
                        variant={track.soloed ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-12 ${track.soloed ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                        onClick={() => toggleSolo(track.id)}
                      >
                        S
                      </Button>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Slider
                          value={[track.volume]}
                          min={0}
                          max={100}
                          step={1}
                          className="flex-1"
                          onValueChange={(value) => handleVolumeChange(track.id, value[0])}
                        />
                        <span className="text-xs w-8 text-right">{track.volume}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Reverb</Label>
                        <Slider
                          value={[track.effects.reverb]}
                          min={0}
                          max={100}
                          step={1}
                          className="my-1"
                          onValueChange={(value) => handleEffectChange(track.id, 'reverb', value[0])}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Delay</Label>
                        <Slider
                          value={[track.effects.delay]}
                          min={0}
                          max={100}
                          step={1}
                          className="my-1"
                          onValueChange={(value) => handleEffectChange(track.id, 'delay', value[0])}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            {tracks.map(track => (
              <Card key={track.id} className={track.type === 'vocals' ? 'border-primary/30' : ''}>
                <CardHeader className="p-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {track.type === 'vocals' ? (
                      <Voicemail size={16} />
                    ) : (
                      <Waves size={16} />
                    )}
                    {track.name} Effects
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 flex items-center gap-1">
                          <AreaChart size={14} />
                          Equalizer
                        </Label>
                        
                        <div className="space-y-3 mt-2">
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Low</Label>
                              <span className="text-xs">{track.effects.eq.low} dB</span>
                            </div>
                            <Slider
                              value={[track.effects.eq.low]}
                              min={-12}
                              max={12}
                              step={0.1}
                              onValueChange={(value) => handleEffectChange(track.id, 'eq', value[0], 'low')}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Mid</Label>
                              <span className="text-xs">{track.effects.eq.mid} dB</span>
                            </div>
                            <Slider
                              value={[track.effects.eq.mid]}
                              min={-12}
                              max={12}
                              step={0.1}
                              onValueChange={(value) => handleEffectChange(track.id, 'eq', value[0], 'mid')}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">High</Label>
                              <span className="text-xs">{track.effects.eq.high} dB</span>
                            </div>
                            <Slider
                              value={[track.effects.eq.high]}
                              min={-12}
                              max={12}
                              step={0.1}
                              onValueChange={(value) => handleEffectChange(track.id, 'eq', value[0], 'high')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 flex items-center gap-1">
                          <Waves size={14} />
                          Reverb
                        </Label>
                        
                        <div className="flex justify-between mb-1">
                          <Label className="text-xs">Amount</Label>
                          <span className="text-xs">{track.effects.reverb}%</span>
                        </div>
                        <Slider
                          value={[track.effects.reverb]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => handleEffectChange(track.id, 'reverb', value[0])}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 flex items-center gap-1">
                          <Timer size={14} />
                          Delay
                        </Label>
                        
                        <div className="flex justify-between mb-1">
                          <Label className="text-xs">Feedback</Label>
                          <span className="text-xs">{track.effects.delay}%</span>
                        </div>
                        <Slider
                          value={[track.effects.delay]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => handleEffectChange(track.id, 'delay', value[0])}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 flex items-center gap-1">
                          <Activity size={14} />
                          Compression
                        </Label>
                        
                        <div className="flex justify-between mb-1">
                          <Label className="text-xs">Amount</Label>
                          <span className="text-xs">{track.effects.compression}%</span>
                        </div>
                        <Slider
                          value={[track.effects.compression]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => handleEffectChange(track.id, 'compression', value[0])}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center pt-4">
        <Button
          onClick={exportMix}
          className="gap-2"
          disabled={tracks.length === 0 || isExporting}
          size="lg"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download size={16} />
              Export Mix
            </>
          )}
        </Button>
      </div>
    </div>
  );
}