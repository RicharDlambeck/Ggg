
import axios from 'axios';
import { VoiceModel } from '@shared/schema';

const COQUI_BASE_URL = 'http://0.0.0.0:5000';

// Trainer API - For training new voice models
export async function trainModel(modelName: string, audioFiles: string[]) {
  return axios.post(`${COQUI_BASE_URL}/api/trainer/train`, {
    name: modelName,
    audio_files: audioFiles
  });
}

// Audio Processor API - For preprocessing audio samples
export async function processAudio(audioFile: string) {
  return axios.post(`${COQUI_BASE_URL}/api/processor/normalize`, {
    audio_file: audioFile
  });
}

// Model API - For managing trained models
export async function getModels() {
  return axios.get(`${COQUI_BASE_URL}/api/models`);
}

export async function synthesize(text: string, modelId: string, settings: any) {
  return axios.post(`${COQUI_BASE_URL}/api/synthesize`, {
    text,
    model_id: modelId,
    settings
  });
}

// Speaker Manager API - For managing voice profiles
export async function getSpeakers(modelId: string) {
  return axios.get(`${COQUI_BASE_URL}/api/speakers/${modelId}`);
}

export async function addSpeaker(modelId: string, name: string, samples: string[]) {
  return axios.post(`${COQUI_BASE_URL}/api/speakers/${modelId}/add`, {
    name,
    samples
  });
}

// GAN API - For voice conversion and enhancement
export async function enhanceVoice(audioFile: string, settings: any) {
  return axios.post(`${COQUI_BASE_URL}/api/gan/enhance`, {
    audio_file: audioFile,
    settings
  });
}
