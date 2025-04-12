import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  userId: true,
});

// Track schema
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), // "instrumental" or "vocal"
  audioUrl: text("audio_url"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  name: true,
  projectId: true,
  type: true,
  audioUrl: true,
  settings: true,
});

// Voice model schema
export const voiceModels = pgTable("voice_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id"),
  type: text("type").notNull(), // "custom" or "featured"
  sampleCount: integer("sample_count"),
  audioSamples: jsonb("audio_samples"),
  isPublic: boolean("is_public").default(false),
});

export const insertVoiceModelSchema = createInsertSchema(voiceModels).pick({
  name: true,
  userId: true,
  type: true,
  sampleCount: true,
  audioSamples: true,
  isPublic: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type VoiceModel = typeof voiceModels.$inferSelect;
export type InsertVoiceModel = z.infer<typeof insertVoiceModelSchema>;

// Project with tracks (for frontend usage)
export type ProjectWithTracks = Project & {
  tracks: Track[];
};

// Define settings types with Zod for better validation
export const vocalSettingsSchema = z.object({
  character: z.number().min(0).max(100).default(70),
  clarity: z.number().min(0).max(100).default(85),
  emotion: z.number().min(0).max(100).default(60),
  style: z.array(z.string()).default(["pop"]),
  lyrics: z.string().optional(),
});

export const instrumentalSettingsSchema = z.object({
  genre: z.string().default("pop"),
  tempo: z.number().min(60).max(200).default(120),
  key: z.string().default("C"),
  mood: z.string().default("energetic"),
  instruments: z.array(z.string()).default(["piano", "guitar", "drums", "bass"]),
});

export type VocalSettings = z.infer<typeof vocalSettingsSchema>;
export type InstrumentalSettings = z.infer<typeof instrumentalSettingsSchema>;
