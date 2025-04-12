import * as Tone from 'tone';

/**
 * Initialize Tone.js context
 * Must be called in response to a user gesture
 */
export async function initializeToneContext(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('Tone.js context started');
  }
}

/**
 * Play a simple tone at a specific note and duration
 * @param note The note to play (e.g., 'C4', 'A3')
 * @param duration Duration in seconds
 */
export function playTestTone(note: string = 'C4', duration: number = 0.5): void {
  // Make sure context is running
  if (Tone.context.state !== 'running') {
    console.warn('Tone.js context not running. Call initializeToneContext first.');
    return;
  }
  
  // Create a synth and connect it to the master output
  const synth = new Tone.Synth().toDestination();
  
  // Trigger the note
  synth.triggerAttackRelease(note, duration);
}

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
 * Play a sequence of notes
 * @param notes Array of notes to play
 * @param duration Duration of each note
 */
export function playNoteSequence(notes: string[], duration: string = '8n'): void {
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  const now = Tone.now();
  
  notes.forEach((note, index) => {
    synth.triggerAttackRelease(note, duration, now + index * 0.5);
  });
}

/**
 * Create an audio player from a URL
 * @param url URL of the audio file
 * @returns Tone.Player object
 */
export function createAudioPlayer(url: string): Tone.Player {
  const player = new Tone.Player({
    url,
    loop: false,
    autostart: false,
  }).toDestination();
  
  return player;
}

/**
 * Create an audio recorder
 * @returns Object with start, stop, and getBuffer methods
 */
export function createAudioRecorder() {
  const recorder = new Tone.Recorder();
  const mic = new Tone.UserMedia();
  
  let isRecording = false;
  
  return {
    start: async () => {
      try {
        await mic.open();
        mic.connect(recorder);
        recorder.start();
        isRecording = true;
      } catch (e) {
        console.error('Could not access microphone', e);
        throw e;
      }
    },
    stop: async () => {
      if (!isRecording) return null;
      
      const recording = await recorder.stop();
      mic.close();
      isRecording = false;
      
      return recording;
    },
    isRecording: () => isRecording
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
