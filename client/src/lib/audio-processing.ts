import { useToast } from "@/hooks/use-toast";

/**
 * Converts seconds to a formatted time string (MM:SS)
 * @param seconds Number of seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Initiates a download for a generated audio file
 * @param filename Name to save the file as
 */
export function initiateDownload(filename: string): void {
  // In a real app, this would create and download an actual audio file
  // For this demo, we'll create a dummy Blob with a small amount of data
  
  const dummyData = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00, // Chunk size
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    // ... more dummy WAV header data for demonstration
  ]);
  
  const blob = new Blob([dummyData], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Analyzes an audio buffer to get amplitude data
 * @param audioBuffer The audio buffer to analyze
 * @returns Array of amplitude values
 */
export function analyzeAudioAmplitude(audioBuffer: AudioBuffer): number[] {
  const channelData = audioBuffer.getChannelData(0); // Get data from first channel
  const blockSize = Math.floor(channelData.length / 100); // Divide into 100 blocks
  const amplitudes = [];
  
  for (let i = 0; i < 100; i++) {
    const start = i * blockSize;
    let sum = 0;
    
    // Calculate average amplitude in this block
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j]);
    }
    
    amplitudes.push(sum / blockSize);
  }
  
  return amplitudes;
}

/**
 * Creates a simple waveform visualization as SVG path
 * @param amplitudes Array of amplitude values
 * @param height Height of the waveform visualization
 * @returns SVG path string
 */
export function createWaveformPath(amplitudes: number[], height: number): string {
  const width = amplitudes.length;
  const middle = height / 2;
  const scale = height / 2 * 0.9; // 90% of half-height to leave some margin
  
  let path = `M 0,${middle} `;
  
  for (let i = 0; i < amplitudes.length; i++) {
    const x = i;
    const y = middle + (amplitudes[i] * scale);
    path += `L ${x},${y} `;
  }
  
  return path;
}

/**
 * Normalizes an array of audio amplitude values to fit within 0-1 range
 * @param amplitudes Array of amplitude values
 * @returns Normalized amplitude values
 */
export function normalizeAmplitudes(amplitudes: number[]): number[] {
  const max = Math.max(...amplitudes);
  if (max === 0) return amplitudes; // Avoid division by zero
  
  return amplitudes.map(a => a / max);
}

/**
 * Loads an audio file asynchronously
 * @param url URL of the audio file
 * @param audioContext AudioContext instance
 * @returns Promise resolving to AudioBuffer
 */
export async function loadAudioFile(
  url: string, 
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Combines multiple audio tracks into a single mixed track
 * @param tracks Array of AudioBuffer objects to mix
 * @param audioContext AudioContext instance
 * @returns Mixed AudioBuffer
 */
export function mixAudioTracks(
  tracks: AudioBuffer[], 
  audioContext: AudioContext
): AudioBuffer {
  // Find the longest track duration
  const maxDuration = Math.max(...tracks.map(t => t.duration));
  const sampleRate = tracks[0]?.sampleRate || 44100;
  const numberOfChannels = 2; // Stereo output
  
  // Create a new buffer for the mixed output
  const mixedBuffer = audioContext.createBuffer(
    numberOfChannels,
    Math.ceil(maxDuration * sampleRate),
    sampleRate
  );
  
  // Mix all tracks
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const outputData = mixedBuffer.getChannelData(channel);
    
    // For each track, add its data to the output
    for (const track of tracks) {
      const channelToUse = Math.min(channel, track.numberOfChannels - 1);
      const trackData = track.getChannelData(channelToUse);
      
      // Add the track data to the output buffer
      for (let i = 0; i < trackData.length; i++) {
        outputData[i] += trackData[i];
      }
    }
    
    // Normalize to prevent clipping
    const scale = 0.8 / tracks.length;
    for (let i = 0; i < outputData.length; i++) {
      outputData[i] *= scale;
    }
  }
  
  return mixedBuffer;
}
