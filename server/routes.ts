import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Import controllers
import * as trackController from './controllers/track.controller';
import * as instrumentalController from './controllers/instrumental.controller';
import * as voiceController from './controllers/voice.controller';

export async function registerRoutes(app: Express): Promise<Server> {
  // Track routes
  app.post('/api/tracks', trackController.createTrack);
  app.get('/api/tracks', trackController.getTracks);
  app.get('/api/tracks/:id', trackController.getTrack);
  app.patch('/api/tracks/:id', trackController.updateTrack);
  app.delete('/api/tracks/:id', trackController.deleteTrack);
  app.post('/api/tracks/:id/export', trackController.exportTrack);
  app.get('/api/tracks/:id/download', trackController.downloadTrack);
  
  // Instrumental routes
  app.post('/api/instrumentals', instrumentalController.createInstrumental);
  app.get('/api/instrumentals/:id', instrumentalController.getInstrumental);
  app.get('/api/tracks/:trackId/instrumental', instrumentalController.getInstrumentalByTrackId);
  
  // Voice model routes
  app.post('/api/voice-models', voiceController.createVoiceModel);
  app.get('/api/voice-models', voiceController.getVoiceModels);
  app.get('/api/voice-models/:id', voiceController.getVoiceModel);
  
  // Voice sample routes
  app.post('/api/voice-samples', voiceController.addVoiceSample);
  app.get('/api/voice-models/:voiceModelId/samples', voiceController.getVoiceSamples);
  app.delete('/api/voice-samples/:id', voiceController.deleteVoiceSample);
  
  // Vocal routes
  app.post('/api/vocals', voiceController.createVocal);
  app.get('/api/tracks/:trackId/vocals', voiceController.getVocals);
  app.patch('/api/vocals/:id', voiceController.updateVocal);

  const httpServer = createServer(app);
  return httpServer;
}
