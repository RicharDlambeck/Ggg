import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping it from the original template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tracks schema
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  title: true,
  genre: true,
  duration: true,
  userId: true,
});

// Voice models schema
export const voiceModels = pgTable("voice_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sampleCount: integer("sample_count").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertVoiceModelSchema = createInsertSchema(voiceModels).pick({
  name: true,
  sampleCount: true,
  userId: true,
});

// Voice samples schema
export const voiceSamples = pgTable("voice_samples", {
  id: serial("id").primaryKey(),
  duration: integer("duration").notNull(),
  voiceModelId: integer("voice_model_id").notNull(),
});

export const insertVoiceSampleSchema = createInsertSchema(voiceSamples).pick({
  duration: true,
  voiceModelId: true,
});

// Instrumental schema
export const instrumentals = pgTable("instrumentals", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  genre: text("genre").notNull(),
  mood: text("mood").notNull(),
  duration: integer("duration").notNull(),
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),
  trackId: integer("track_id").notNull(),
});

export const insertInstrumentalSchema = createInsertSchema(instrumentals).pick({
  prompt: true,
  genre: true,
  mood: true,
  duration: true,
  bpm: true,
  key: true,
  trackId: true,
});

// Vocals schema
export const vocals = pgTable("vocals", {
  id: serial("id").primaryKey(),
  lyrics: text("lyrics").notNull(),
  style: text("style").notNull(),
  voiceModelId: integer("voice_model_id").notNull(),
  trackId: integer("track_id").notNull(),
  settings: jsonb("settings").notNull(),
});

export const insertVocalSchema = createInsertSchema(vocals).pick({
  lyrics: true,
  style: true,
  voiceModelId: true,
  trackId: true,
  settings: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

export type InsertVoiceModel = z.infer<typeof insertVoiceModelSchema>;
export type VoiceModel = typeof voiceModels.$inferSelect;

export type InsertVoiceSample = z.infer<typeof insertVoiceSampleSchema>;
export type VoiceSample = typeof voiceSamples.$inferSelect;

export type InsertInstrumental = z.infer<typeof insertInstrumentalSchema>;
export type Instrumental = typeof instrumentals.$inferSelect;

export type InsertVocal = z.infer<typeof insertVocalSchema>;
export type Vocal = typeof vocals.$inferSelect;
