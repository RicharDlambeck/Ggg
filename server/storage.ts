import { 
  users, User, InsertUser,
  projects, Project, InsertProject,
  tracks, Track, InsertTrack,
  voiceModels, VoiceModel, InsertVoiceModel,
  ProjectWithTracks
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithTracks(id: number): Promise<ProjectWithTracks | undefined>;
  getUserProjects(userId: number): Promise<ProjectWithTracks[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Track methods
  getTrack(id: number): Promise<Track | undefined>;
  getProjectTracks(projectId: number): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, track: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;

  // Voice model methods
  getVoiceModel(id: number): Promise<VoiceModel | undefined>;
  getUserVoiceModels(userId: number): Promise<VoiceModel[]>;
  getPublicVoiceModels(): Promise<VoiceModel[]>;
  createVoiceModel(voiceModel: InsertVoiceModel): Promise<VoiceModel>;
  updateVoiceModel(id: number, voiceModel: Partial<VoiceModel>): Promise<VoiceModel | undefined>;
  deleteVoiceModel(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tracks: Map<number, Track>;
  private voiceModels: Map<number, VoiceModel>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentTrackId: number;
  private currentVoiceModelId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tracks = new Map();
    this.voiceModels = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentTrackId = 1;
    this.currentVoiceModelId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "password"
    };
    this.users.set(demoUser.id, demoUser);

    // Create a demo project
    const demoProject: Project = {
      id: this.currentProjectId++,
      name: "Summer Vibes",
      userId: demoUser.id,
      lastModified: new Date()
    };
    this.projects.set(demoProject.id, demoProject);

    // Create demo tracks
    const tracks: Track[] = [
      {
        id: this.currentTrackId++,
        name: "Main Beat",
        projectId: demoProject.id,
        type: "instrumental",
        audioUrl: "/api/audio/demo-beat.mp3",
        settings: {
          genre: "pop",
          tempo: 120,
          key: "C",
          mood: "energetic",
          instruments: ["piano", "guitar", "drums", "bass"]
        },
        createdAt: new Date()
      },
      {
        id: this.currentTrackId++,
        name: "Vocals Track",
        projectId: demoProject.id,
        type: "vocal",
        audioUrl: "/api/audio/demo-vocals.mp3",
        settings: {
          character: 70,
          clarity: 85,
          emotion: 60,
          style: ["pop"],
          lyrics: "I've been walking through the city lights\nWondering where you are tonight\nSummer vibes, in the cool night air\nMemories that take me everywhere\n\n[Chorus]\nOh, these summer nights\nUnder crystal skies\nMaking memories, you and I\nThese moments in time"
        },
        createdAt: new Date()
      },
      {
        id: this.currentTrackId++,
        name: "Background Melody",
        projectId: demoProject.id,
        type: "instrumental",
        audioUrl: "/api/audio/demo-melody.mp3",
        settings: {
          genre: "pop",
          tempo: 120,
          key: "C",
          mood: "dreamy",
          instruments: ["piano", "synth"]
        },
        createdAt: new Date()
      }
    ];

    tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });

    // Create demo voice models
    const voiceModels: VoiceModel[] = [
      {
        id: this.currentVoiceModelId++,
        name: "Summer Pop Voice",
        userId: demoUser.id,
        type: "custom",
        sampleCount: 3,
        audioSamples: ["/api/audio/sample1.mp3", "/api/audio/sample2.mp3", "/api/audio/sample3.mp3"],
        isPublic: false
      },
      {
        id: this.currentVoiceModelId++,
        name: "Rich Baritone",
        userId: null,
        type: "featured",
        sampleCount: 5,
        audioSamples: ["/api/audio/baritone1.mp3"],
        isPublic: true
      },
      {
        id: this.currentVoiceModelId++,
        name: "Jazz Vocals",
        userId: demoUser.id,
        type: "custom",
        sampleCount: 5,
        audioSamples: ["/api/audio/jazz1.mp3", "/api/audio/jazz2.mp3"],
        isPublic: false
      },
      {
        id: this.currentVoiceModelId++,
        name: "Soft Alto",
        userId: null,
        type: "featured",
        sampleCount: 4,
        audioSamples: ["/api/audio/alto1.mp3"],
        isPublic: true
      }
    ];

    voiceModels.forEach(model => {
      this.voiceModels.set(model.id, model);
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectWithTracks(id: number): Promise<ProjectWithTracks | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const projectTracks = Array.from(this.tracks.values()).filter(
      track => track.projectId === id
    );

    return {
      ...project,
      tracks: projectTracks
    };
  }

  async getUserProjects(userId: number): Promise<ProjectWithTracks[]> {
    const userProjects = Array.from(this.projects.values()).filter(
      project => project.userId === userId
    );

    return Promise.all(
      userProjects.map(async project => {
        const tracks = Array.from(this.tracks.values()).filter(
          track => track.projectId === project.id
        );
        return { ...project, tracks };
      })
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      lastModified: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { 
      ...project, 
      ...projectUpdate,
      lastModified: new Date()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete all associated tracks first
    const projectTracks = Array.from(this.tracks.values()).filter(
      track => track.projectId === id
    );
    
    projectTracks.forEach(track => {
      this.tracks.delete(track.id);
    });

    return this.projects.delete(id);
  }

  // Track methods
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getProjectTracks(projectId: number): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(
      track => track.projectId === projectId
    );
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.currentTrackId++;
    const track: Track = { 
      ...insertTrack, 
      id, 
      createdAt: new Date()
    };
    this.tracks.set(id, track);
    
    // Update the project's lastModified timestamp
    if (insertTrack.projectId) {
      const project = this.projects.get(insertTrack.projectId);
      if (project) {
        this.projects.set(project.id, {
          ...project,
          lastModified: new Date()
        });
      }
    }
    
    return track;
  }

  async updateTrack(id: number, trackUpdate: Partial<Track>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;

    const updatedTrack = { ...track, ...trackUpdate };
    this.tracks.set(id, updatedTrack);
    
    // Update the project's lastModified timestamp
    const project = this.projects.get(track.projectId);
    if (project) {
      this.projects.set(project.id, {
        ...project,
        lastModified: new Date()
      });
    }
    
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const track = this.tracks.get(id);
    if (track) {
      // Update the project's lastModified timestamp
      const project = this.projects.get(track.projectId);
      if (project) {
        this.projects.set(project.id, {
          ...project,
          lastModified: new Date()
        });
      }
    }
    
    return this.tracks.delete(id);
  }

  // Voice model methods
  async getVoiceModel(id: number): Promise<VoiceModel | undefined> {
    return this.voiceModels.get(id);
  }

  async getUserVoiceModels(userId: number): Promise<VoiceModel[]> {
    return Array.from(this.voiceModels.values()).filter(
      model => model.userId === userId
    );
  }

  async getPublicVoiceModels(): Promise<VoiceModel[]> {
    return Array.from(this.voiceModels.values()).filter(
      model => model.isPublic === true
    );
  }

  async createVoiceModel(insertVoiceModel: InsertVoiceModel): Promise<VoiceModel> {
    const id = this.currentVoiceModelId++;
    const voiceModel: VoiceModel = { ...insertVoiceModel, id };
    this.voiceModels.set(id, voiceModel);
    return voiceModel;
  }

  async updateVoiceModel(id: number, voiceModelUpdate: Partial<VoiceModel>): Promise<VoiceModel | undefined> {
    const voiceModel = this.voiceModels.get(id);
    if (!voiceModel) return undefined;

    const updatedVoiceModel = { ...voiceModel, ...voiceModelUpdate };
    this.voiceModels.set(id, updatedVoiceModel);
    return updatedVoiceModel;
  }

  async deleteVoiceModel(id: number): Promise<boolean> {
    return this.voiceModels.delete(id);
  }
}

export const storage = new MemStorage();
