import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateInstrumental, generateVocals } from "./lib/openai";
import { generateLyrics } from "./lib/lyrics-generator";
import { 
  insertProjectSchema,
  insertTrackSchema,
  insertVoiceModelSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Create temp directory for audio files if it doesn't exist
  const audioDir = path.resolve(process.cwd(), "temp/audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // ===== Project Routes =====
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      // For demo, we'll use userId 1
      const userId = 1;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects", error: (error as Error).message });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectWithTracks(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project", error: (error as Error).message });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error: (error as Error).message });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = req.body;
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error: (error as Error).message });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const deleted = await storage.deleteProject(projectId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project", error: (error as Error).message });
    }
  });

  // ===== Track Routes =====
  app.get("/api/tracks/:id", async (req: Request, res: Response) => {
    try {
      const trackId = parseInt(req.params.id);
      const track = await storage.getTrack(trackId);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch track", error: (error as Error).message });
    }
  });

  app.post("/api/tracks", async (req: Request, res: Response) => {
    try {
      const trackData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(trackData);
      res.status(201).json(track);
    } catch (error) {
      res.status(400).json({ message: "Invalid track data", error: (error as Error).message });
    }
  });

  app.put("/api/tracks/:id", async (req: Request, res: Response) => {
    try {
      const trackId = parseInt(req.params.id);
      const trackData = req.body;
      
      const updatedTrack = await storage.updateTrack(trackId, trackData);
      
      if (!updatedTrack) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(updatedTrack);
    } catch (error) {
      res.status(400).json({ message: "Invalid track data", error: (error as Error).message });
    }
  });

  app.delete("/api/tracks/:id", async (req: Request, res: Response) => {
    try {
      const trackId = parseInt(req.params.id);
      const deleted = await storage.deleteTrack(trackId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json({ message: "Track deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete track", error: (error as Error).message });
    }
  });

  // ===== Voice Model Routes =====
  app.get("/api/voice-models", async (_req: Request, res: Response) => {
    try {
      // For demo, we'll use userId 1
      const userId = 1;
      const userModels = await storage.getUserVoiceModels(userId);
      const publicModels = await storage.getPublicVoiceModels();
      
      // Merge and deduplicate
      const allModels = [...userModels];
      publicModels.forEach(model => {
        if (!allModels.some(m => m.id === model.id)) {
          allModels.push(model);
        }
      });
      
      res.json(allModels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voice models", error: (error as Error).message });
    }
  });

  app.get("/api/voice-models/:id", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getVoiceModel(modelId);
      
      if (!model) {
        return res.status(404).json({ message: "Voice model not found" });
      }
      
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voice model", error: (error as Error).message });
    }
  });

  app.post("/api/voice-models", upload.array("audioSamples"), async (req: Request, res: Response) => {
    try {
      // Save uploaded files to temp directory and get their paths
      const files = req.files as Express.Multer.File[];
      const audioSamples = files.map((file, index) => {
        const filename = `voice-sample-${Date.now()}-${index}${path.extname(file.originalname)}`;
        const filepath = path.join(audioDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        return `/api/audio/${filename}`;
      });

      const modelData = {
        ...req.body,
        userId: 1, // For demo, we'll use userId 1
        sampleCount: audioSamples.length,
        audioSamples,
        isPublic: req.body.isPublic === "true",
      };

      const validatedData = insertVoiceModelSchema.parse(modelData);
      const model = await storage.createVoiceModel(validatedData);
      
      res.status(201).json(model);
    } catch (error) {
      res.status(400).json({ message: "Invalid voice model data", error: (error as Error).message });
    }
  });

  // ===== AI Generation Routes =====
  app.post("/api/generate/instrumental", async (req: Request, res: Response) => {
    try {
      const { genre, tempo, key, mood, duration } = req.body;
      
      // For demo, return a mock audio URL
      // In a real implementation, this would call OpenAI or another service
      const instrumentalUrl = await generateInstrumental({
        genre,
        tempo,
        key,
        mood,
        duration
      });
      
      res.json({ audioUrl: instrumentalUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate instrumental", error: (error as Error).message });
    }
  });

  app.post("/api/generate/vocals", async (req: Request, res: Response) => {
    try {
      const { lyrics, voiceModelId, settings } = req.body;
      
      // Get the voice model
      const voiceModel = await storage.getVoiceModel(parseInt(voiceModelId));
      
      if (!voiceModel) {
        return res.status(404).json({ message: "Voice model not found" });
      }
      
      // For demo, return a mock audio URL
      // In a real implementation, this would call OpenAI or another service
      const vocalUrl = await generateVocals({
        lyrics,
        voiceModel,
        settings
      });
      
      res.json({ audioUrl: vocalUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate vocals", error: (error as Error).message });
    }
  });

  // ===== Audio File Serving =====
  app.get("/api/audio/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(audioDir, filename);
    
    // Check if file exists
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      // For demo purposes, send a default audio file
      res.sendFile(path.join(audioDir, "default.mp3"));
    }
  });

  return httpServer;
}
