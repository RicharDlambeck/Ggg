import { 
  users, type User, type InsertUser,
  tracks, type Track, type InsertTrack,
  voiceModels, type VoiceModel, type InsertVoiceModel,
  voiceSamples, type VoiceSample, type InsertVoiceSample,
  instrumentals, type Instrumental, type InsertInstrumental,
  vocals, type Vocal, type InsertVocal
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tracks
  createTrack(track: InsertTrack): Promise<Track>;
  getTrack(id: number): Promise<Track | undefined>;
  getTracksByUserId(userId: number): Promise<Track[]>;
  updateTrack(id: number, track: Partial<InsertTrack>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;
  
  // Voice Models
  createVoiceModel(voiceModel: InsertVoiceModel): Promise<VoiceModel>;
  getVoiceModel(id: number): Promise<VoiceModel | undefined>;
  getVoiceModelsByUserId(userId: number): Promise<VoiceModel[]>;
  updateVoiceModel(id: number, voiceModel: Partial<InsertVoiceModel>): Promise<VoiceModel | undefined>;
  deleteVoiceModel(id: number): Promise<boolean>;
  
  // Voice Samples
  createVoiceSample(voiceSample: InsertVoiceSample): Promise<VoiceSample>;
  getVoiceSamplesByModelId(voiceModelId: number): Promise<VoiceSample[]>;
  deleteVoiceSample(id: number): Promise<boolean>;
  
  // Instrumentals
  createInstrumental(instrumental: InsertInstrumental): Promise<Instrumental>;
  getInstrumental(id: number): Promise<Instrumental | undefined>;
  getInstrumentalByTrackId(trackId: number): Promise<Instrumental | undefined>;
  
  // Vocals
  createVocal(vocal: InsertVocal): Promise<Vocal>;
  getVocal(id: number): Promise<Vocal | undefined>;
  getVocalsByTrackId(trackId: number): Promise<Vocal[]>;
  updateVocal(id: number, vocal: Partial<InsertVocal>): Promise<Vocal | undefined>;
  deleteVocal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tracks: Map<number, Track>;
  private voiceModels: Map<number, VoiceModel>;
  private voiceSamples: Map<number, VoiceSample>;
  private instrumentals: Map<number, Instrumental>;
  private vocals: Map<number, Vocal>;
  
  private userId: number = 1;
  private trackId: number = 1;
  private voiceModelId: number = 1;
  private voiceSampleId: number = 1;
  private instrumentalId: number = 1;
  private vocalId: number = 1;

  constructor() {
    this.users = new Map();
    this.tracks = new Map();
    this.voiceModels = new Map();
    this.voiceSamples = new Map();
    this.instrumentals = new Map();
    this.vocals = new Map();
    
    // Create a demo user
    this.createUser({
      username: "demo",
      password: "demo"
    });
    
    // Create demo voice models
    const voiceModel1 = this.createVoiceModel({
      name: "My Voice",
      sampleCount: 10,
      userId: 1
    });
    
    const voiceModel2 = this.createVoiceModel({
      name: "Alto Voice",
      sampleCount: 4,
      userId: 1
    });
    
    // Create demo track
    const track1 = this.createTrack({
      title: "Summer Vibes",
      genre: "Pop",
      duration: 165,
      userId: 1
    });
    
    const track2 = this.createTrack({
      title: "Midnight Dreams",
      genre: "Electronic",
      duration: 192,
      userId: 1
    });
    
    const track3 = this.createTrack({
      title: "Urban Beats",
      genre: "Hip-Hop",
      duration: 112,
      userId: 1
    });
    
    // Create demo instrumental
    this.createInstrumental({
      prompt: "Upbeat summer pop with acoustic guitar, light percussion, and catchy melody. Similar to 'Happy' by Pharrell but more chill.",
      genre: "Pop",
      mood: "Upbeat",
      duration: 192,
      bpm: 120,
      key: "C Major",
      trackId: 2
    });
    
    // Create demo vocal
    this.createVocal({
      lyrics: "Walking down the sunny street,\nFeeling rhythm in my feet.\nSummer days and starry nights,\nEverything is feeling right.",
      style: "Happy",
      voiceModelId: 1,
      trackId: 2,
      settings: {
        pitch: 0,
        clarity: 2,
        vibrato: -1,
        autoTune: false,
        matchRhythm: true,
        reverb: false
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Track methods
  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.trackId++;
    const now = new Date();
    const track: Track = { 
      ...insertTrack, 
      id, 
      createdAt: now
    };
    this.tracks.set(id, track);
    return track;
  }
  
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }
  
  async getTracksByUserId(userId: number): Promise<Track[]> {
    return Array.from(this.tracks.values())
      .filter(track => track.userId === userId)
      .sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      });
  }
  
  async updateTrack(id: number, trackUpdate: Partial<InsertTrack>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    
    const updatedTrack = { ...track, ...trackUpdate };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }
  
  async deleteTrack(id: number): Promise<boolean> {
    const success = this.tracks.delete(id);
    
    // Clean up related resources
    Array.from(this.instrumentals.values())
      .filter(instrumental => instrumental.trackId === id)
      .forEach(instrumental => {
        this.instrumentals.delete(instrumental.id);
      });
      
    Array.from(this.vocals.values())
      .filter(vocal => vocal.trackId === id)
      .forEach(vocal => {
        this.vocals.delete(vocal.id);
      });
      
    return success;
  }
  
  // Voice Model methods
  async createVoiceModel(insertVoiceModel: InsertVoiceModel): Promise<VoiceModel> {
    const id = this.voiceModelId++;
    const now = new Date();
    const voiceModel: VoiceModel = {
      ...insertVoiceModel,
      id,
      createdAt: now
    };
    this.voiceModels.set(id, voiceModel);
    return voiceModel;
  }
  
  async getVoiceModel(id: number): Promise<VoiceModel | undefined> {
    return this.voiceModels.get(id);
  }
  
  async getVoiceModelsByUserId(userId: number): Promise<VoiceModel[]> {
    return Array.from(this.voiceModels.values())
      .filter(model => model.userId === userId);
  }
  
  async updateVoiceModel(id: number, voiceModelUpdate: Partial<InsertVoiceModel>): Promise<VoiceModel | undefined> {
    const voiceModel = this.voiceModels.get(id);
    if (!voiceModel) return undefined;
    
    const updatedVoiceModel = { ...voiceModel, ...voiceModelUpdate };
    this.voiceModels.set(id, updatedVoiceModel);
    return updatedVoiceModel;
  }
  
  async deleteVoiceModel(id: number): Promise<boolean> {
    const success = this.voiceModels.delete(id);
    
    // Clean up related resources
    Array.from(this.voiceSamples.values())
      .filter(sample => sample.voiceModelId === id)
      .forEach(sample => {
        this.voiceSamples.delete(sample.id);
      });
      
    return success;
  }
  
  // Voice Sample methods
  async createVoiceSample(insertVoiceSample: InsertVoiceSample): Promise<VoiceSample> {
    const id = this.voiceSampleId++;
    const voiceSample: VoiceSample = {
      ...insertVoiceSample,
      id
    };
    this.voiceSamples.set(id, voiceSample);
    
    // Update sample count in voice model
    const voiceModel = this.voiceModels.get(voiceSample.voiceModelId);
    if (voiceModel) {
      voiceModel.sampleCount += 1;
      this.voiceModels.set(voiceModel.id, voiceModel);
    }
    
    return voiceSample;
  }
  
  async getVoiceSamplesByModelId(voiceModelId: number): Promise<VoiceSample[]> {
    return Array.from(this.voiceSamples.values())
      .filter(sample => sample.voiceModelId === voiceModelId);
  }
  
  async deleteVoiceSample(id: number): Promise<boolean> {
    const sample = this.voiceSamples.get(id);
    if (!sample) return false;
    
    const success = this.voiceSamples.delete(id);
    
    // Update sample count in voice model
    if (success) {
      const voiceModel = this.voiceModels.get(sample.voiceModelId);
      if (voiceModel) {
        voiceModel.sampleCount -= 1;
        this.voiceModels.set(voiceModel.id, voiceModel);
      }
    }
    
    return success;
  }
  
  // Instrumental methods
  async createInstrumental(insertInstrumental: InsertInstrumental): Promise<Instrumental> {
    const id = this.instrumentalId++;
    const instrumental: Instrumental = {
      ...insertInstrumental,
      id
    };
    this.instrumentals.set(id, instrumental);
    return instrumental;
  }
  
  async getInstrumental(id: number): Promise<Instrumental | undefined> {
    return this.instrumentals.get(id);
  }
  
  async getInstrumentalByTrackId(trackId: number): Promise<Instrumental | undefined> {
    return Array.from(this.instrumentals.values())
      .find(instrumental => instrumental.trackId === trackId);
  }
  
  // Vocal methods
  async createVocal(insertVocal: InsertVocal): Promise<Vocal> {
    const id = this.vocalId++;
    const vocal: Vocal = {
      ...insertVocal,
      id
    };
    this.vocals.set(id, vocal);
    return vocal;
  }
  
  async getVocal(id: number): Promise<Vocal | undefined> {
    return this.vocals.get(id);
  }
  
  async getVocalsByTrackId(trackId: number): Promise<Vocal[]> {
    return Array.from(this.vocals.values())
      .filter(vocal => vocal.trackId === trackId);
  }
  
  async updateVocal(id: number, vocalUpdate: Partial<InsertVocal>): Promise<Vocal | undefined> {
    const vocal = this.vocals.get(id);
    if (!vocal) return undefined;
    
    const updatedVocal = { ...vocal, ...vocalUpdate };
    this.vocals.set(id, updatedVocal);
    return updatedVocal;
  }
  
  async deleteVocal(id: number): Promise<boolean> {
    return this.vocals.delete(id);
  }
}

export const storage = new MemStorage();
