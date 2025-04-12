import * as Tone from 'tone';

// Initialize Tone.js
export async function initializeAudio() {
  await Tone.start();
  console.log('Audio engine initialized');
}

// A class to handle audio playback and manipulation
export class AudioPlayer {
  private player: Tone.Player | null = null;
  private gainNode: Tone.Gain;
  private analyzer: Tone.Analyser;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private currentTime: number = 0;
  private duration: number = 0;
  private onPlayCallback: (() => void) | null = null;
  private onStopCallback: (() => void) | null = null;
  private onPauseCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;

  constructor() {
    this.gainNode = new Tone.Gain(0.8).toDestination();
    this.analyzer = new Tone.Analyser('waveform', 256);
    this.gainNode.connect(this.analyzer);
  }

  async loadAudio(url: string): Promise<void> {
    try {
      if (this.player) {
        this.player.dispose();
      }
      
      this.player = new Tone.Player(url, () => {
        console.log('Audio loaded successfully');
        this.duration = this.player!.buffer.duration;
      }).connect(this.gainNode);
      
      return new Promise((resolve, reject) => {
        if (!this.player) {
          return reject(new Error('Player not initialized'));
        }
        
        this.player.onstop = () => {
          this.isPlaying = false;
          this.currentTime = 0;
          if (this.onStopCallback) this.onStopCallback();
        };
        
        this.player.onload = () => resolve();
        this.player.onerror = (error) => reject(error);
      });
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  play(): void {
    if (!this.player) return;
    
    if (!this.isPlaying) {
      this.startTime = Tone.now() - this.currentTime;
      this.player.start(0, this.currentTime);
      this.isPlaying = true;
      
      if (this.onPlayCallback) this.onPlayCallback();
      
      // Start updating current time
      this.updateTime();
    }
  }

  pause(): void {
    if (!this.player || !this.isPlaying) return;
    
    this.currentTime = Tone.now() - this.startTime;
    this.player.stop();
    this.isPlaying = false;
    
    if (this.onPauseCallback) this.onPauseCallback();
  }

  stop(): void {
    if (!this.player) return;
    
    this.player.stop();
    this.isPlaying = false;
    this.currentTime = 0;
    
    if (this.onStopCallback) this.onStopCallback();
  }

  setVolume(volume: number): void {
    if (volume >= 0 && volume <= 1) {
      this.gainNode.gain.value = volume;
    }
  }

  seek(time: number): void {
    if (!this.player) return;
    
    if (time >= 0 && time <= this.duration) {
      const wasPlaying = this.isPlaying;
      
      if (wasPlaying) {
        this.player.stop();
      }
      
      this.currentTime = time;
      
      if (wasPlaying) {
        this.startTime = Tone.now() - this.currentTime;
        this.player.start(0, this.currentTime);
      }
      
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.currentTime);
    }
  }

  getWaveformData(): Float32Array {
    return this.analyzer.getValue() as Float32Array;
  }

  getDuration(): number {
    return this.duration;
  }

  getCurrentTime(): number {
    if (this.isPlaying) {
      return Tone.now() - this.startTime;
    }
    return this.currentTime;
  }

  isPlayingAudio(): boolean {
    return this.isPlaying;
  }

  onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  onStop(callback: () => void): void {
    this.onStopCallback = callback;
  }

  onPause(callback: () => void): void {
    this.onPauseCallback = callback;
  }

  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  private updateTime(): void {
    if (!this.isPlaying) return;
    
    this.currentTime = Tone.now() - this.startTime;
    
    if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.currentTime);
    
    if (this.currentTime >= this.duration) {
      this.stop();
      return;
    }
    
    requestAnimationFrame(() => this.updateTime());
  }

  dispose(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    
    this.gainNode.dispose();
    this.analyzer.dispose();
  }
}

// Convert seconds to MM:SS format
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
