import * as Tone from 'tone';

/**
 * Create a metronome that plays at a given BPM
 * @param bpm Beats per minute
 * @returns Object with start and stop methods
 */
export function createMetronome(bpm: number = 120) {
  const synth = new Tone.MembraneSynth({
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    },
    octaves: 4,
    pitchDecay: 0.05
  }).toDestination();
  
  const loop = new Tone.Loop(time => {
    synth.triggerAttackRelease('C2', '32n', time);
  }, '4n');
  
  return {
    start: () => {
      Tone.Transport.bpm.value = bpm;
      Tone.Transport.start();
      loop.start(0);
    },
    stop: () => {
      loop.stop();
      Tone.Transport.stop();
    },
    setBpm: (newBpm: number) => {
      Tone.Transport.bpm.value = newBpm;
    }
  };
}

/**
 * Creates a simple drum pattern
 * @param bpm Beats per minute
 * @param pattern Drum pattern (kick, snare, hihat indexes)
 * @returns Object with start and stop methods
 */
export function createDrumPattern(bpm: number = 120, pattern: number[][] = [[0, 4], [2, 6], [0, 1, 2, 3, 4, 5, 6, 7]]) {
  const kick = new Tone.MembraneSynth().toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).toDestination();
  const hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();
  
  hihat.volume.value = -20;
  
  const loop = new Tone.Sequence((time, step) => {
    if (pattern[0].includes(step)) {
      kick.triggerAttackRelease('C1', '8n', time);
    }
    if (pattern[1].includes(step)) {
      snare.triggerAttackRelease('16n', time);
    }
    if (pattern[2].includes(step)) {
      hihat.triggerAttackRelease('C6', '32n', time);
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7], '8n');
  
  return {
    start: () => {
      Tone.Transport.bpm.value = bpm;
      Tone.Transport.start();
      loop.start(0);
    },
    stop: () => {
      loop.stop();
      Tone.Transport.stop();
    },
    setBpm: (newBpm: number) => {
      Tone.Transport.bpm.value = newBpm;
    }
  };
}

/**
 * Create a chord sequence
 * @param chords Array of chord note arrays
 * @param bpm Beats per minute
 * @param noteDuration Duration of each note in seconds
 * @param velocity Volume (0-1)
 * @returns Object with start and stop methods
 */
export function createChordSequence(
  chords: string[][],
  bpm: number = 120,
  noteDuration: number = 0.2,
  velocity: number = 0.7
) {
  const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
  polySynth.volume.value = -10; // Reduce volume to avoid clipping

  // Convert duration to Tone.js time value
  const duration = `${noteDuration * 4}n`;
  
  // Create sequence
  const sequence = new Tone.Sequence(
    (time, chord) => {
      polySynth.triggerAttackRelease(chord, duration, time, velocity);
    },
    chords,
    '1n'
  );
  
  return {
    start: () => {
      Tone.Transport.bpm.value = bpm;
      Tone.Transport.start();
      sequence.start(0);
    },
    stop: () => {
      sequence.stop();
      Tone.Transport.stop();
    },
    setBpm: (newBpm: number) => {
      Tone.Transport.bpm.value = newBpm;
    }
  };
}

/**
 * Create a bass line
 * @param notes Array of bass notes
 * @param bpm Beats per minute
 * @returns Object with start and stop methods
 */
export function createBassLine(notes: string[], bpm: number = 120) {
  const bassSynth = new Tone.MonoSynth({
    oscillator: {
      type: 'sawtooth'
    },
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.4,
      release: 0.8
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.5,
      release: 0.8,
      baseFrequency: 200,
      octaves: 2.5
    }
  }).toDestination();
  
  bassSynth.volume.value = -5;
  
  // Create a repeated pattern
  const expandedNotes = [];
  for (let note of notes) {
    expandedNotes.push(note);
    expandedNotes.push(null); // Rest between notes
  }
  
  const bassSequence = new Tone.Sequence(
    (time, note) => {
      if (note !== null) {
        bassSynth.triggerAttackRelease(note, '8n', time);
      }
    },
    expandedNotes,
    '8n'
  );
  
  return {
    start: () => {
      Tone.Transport.bpm.value = bpm;
      Tone.Transport.start();
      bassSequence.start(0);
    },
    stop: () => {
      bassSequence.stop();
      Tone.Transport.stop();
    },
    setBpm: (newBpm: number) => {
      Tone.Transport.bpm.value = newBpm;
    }
  };
}

/**
 * Generate a complete instrumental track
 * @param params Configuration parameters for the track
 * @returns Promise resolving to audio buffer
 */
export async function generateTrack(params: {
  genre: string,
  tempo: number,
  key: string,
  mood: string,
  chords: string[][],
  bassNotes: string[],
  drumPattern: number[][],
  duration: number
}): Promise<ArrayBuffer> {
  // This function would combine the above functions to create a complete track
  // For now, it's a placeholder as server-side rendering with Tone.js needs special handling
  
  return new Promise((resolve) => {
    // In a real implementation, this would combine the patterns
    // and render to a buffer using Tone.Offline
    
    // Simulating a buffer of the appropriate length (in samples)
    const sampleRate = 44100;
    const seconds = params.duration;
    const buffer = new ArrayBuffer(sampleRate * seconds * 4); // 4 bytes per sample (stereo float32)
    
    // Resolve with the simulated buffer
    setTimeout(() => resolve(buffer), 1000);
  });
}