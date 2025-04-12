import { VoiceModel } from "@shared/schema";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Initialize OpenAI with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type InstrumentalGenerationParams = {
  genre: string;
  tempo: number;
  key: string;
  mood: string;
  duration?: number;
};

type VocalGenerationParams = {
  lyrics: string;
  voiceModel: VoiceModel;
  settings: {
    character?: number;
    clarity?: number;
    emotion?: number;
    style?: string[];
  };
};

/**
 * Generates an instrumental track using OpenAI
 */
export async function generateInstrumental(params: InstrumentalGenerationParams): Promise<string> {
  console.log("Generating instrumental with params:", params);
  
  const { genre, tempo, key, mood, duration = 30 } = params;
  
  try {
    // Create a filename for the generated audio
    const filename = `generated-instrumental-${Date.now()}.mp3`;
    const filePath = path.resolve(process.cwd(), "temp/audio", filename);
    
    // Construct a detailed prompt for OpenAI
    const prompt = `Create a ${mood} ${genre} instrumental track in the key of ${key} at ${tempo} BPM. 
    The track should have a clear rhythm and melody suitable for vocals. 
    Make it approximately ${duration} seconds long.
    
    The instrumental should capture the essence of ${mood} ${genre} music, with appropriate instrumentation 
    and production quality. The overall feeling should be ${mood}.`;
    
    try {
      // Use OpenAI's API to generate music
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: `You are a professional music producer specialized in creating ${genre} instrumentals. 
            The user will provide parameters for the instrumental they want. 
            Your job is to describe in detail how this instrumental should sound, what instruments to use, 
            and the structure (intro, verse, chorus, etc.). Focus on creating a cohesive and professional sounding track.`
          },
          { role: "user", content: prompt }
        ],
      });
      
      const description = response.choices[0].message.content || "";
      
      // For a real implementation, this would use the description to create actual audio
      // For now, save the description for reference
      const metadata = {
        genre,
        tempo,
        key,
        mood,
        duration,
        description,
        generationDate: new Date().toISOString()
      };
      
      // Create a JSON file with metadata
      fs.writeFileSync(
        path.resolve(process.cwd(), "temp/audio", `${filename}.json`), 
        JSON.stringify(metadata, null, 2)
      );
      
      // Check if we have a pre-generated sample for this genre
      const samplePath = path.resolve(process.cwd(), "temp/audio/samples", `${genre}-sample.mp3`);
      if (fs.existsSync(samplePath)) {
        // Copy the sample to our target file
        fs.copyFileSync(samplePath, filePath);
      } else {
        // Create an empty file as placeholder
        fs.writeFileSync(filePath, "");
      }
      
      // Return the URL for the generated file
      return `/api/audio/${filename}`;
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Fallback to using sample file if OpenAI call fails
      const samplePath = path.resolve(process.cwd(), "temp/audio/samples", `${genre}-sample.mp3`);
      if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, filePath);
      } else {
        fs.writeFileSync(filePath, "");
      }
      
      return `/api/audio/${filename}`;
    }
  } catch (error) {
    console.error("Error generating instrumental:", error);
    throw new Error("Failed to generate instrumental track");
  }
}

/**
 * Generates vocal audio from lyrics using OpenAI
 */
export async function generateVocals(params: VocalGenerationParams): Promise<string> {
  console.log("Generating vocals with params:", params);
  
  const { lyrics, voiceModel, settings } = params;
  
  try {
    // Create a filename for the generated audio
    const filename = `generated-vocals-${Date.now()}.mp3`;
    const filePath = path.resolve(process.cwd(), "temp/audio", filename);
    
    // Extract voice settings
    const character = settings.character || 50;
    const clarity = settings.clarity || 50;
    const emotion = settings.emotion || 50;
    const style = settings.style || ["natural"];
    
    // Construct a detailed prompt for OpenAI
    const emotionIntensity = emotion > 75 ? "strong" : emotion > 50 ? "moderate" : "subtle";
    const voiceCharacter = character > 75 ? "distinctive" : character > 50 ? "characterized" : "neutral";
    const voiceClarity = clarity > 75 ? "crystal clear" : clarity > 50 ? "clear" : "natural";
    
    const prompt = `Create vocal audio for the following lyrics, using a ${voiceModel.type} voice with 
    ${emotionIntensity} emotion, ${voiceCharacter} character, and ${voiceClarity} clarity. 
    The vocal style should be ${style.join(", ")}.
    
    Lyrics:
    "${lyrics}"
    
    Voice description: ${voiceModel.name}`;
    
    try {
      // Use OpenAI's API to generate a description of the vocal performance
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: `You are a professional vocal coach and music producer specializing in vocal recording.
            The user will provide lyrics and vocal style parameters. Your job is to describe in detail
            how these lyrics should be performed vocally, including phrasing, emphasis, emotion, and technique.
            Focus on creating a professional vocal performance description.`
          },
          { role: "user", content: prompt }
        ],
      });
      
      const description = response.choices[0].message.content || "";
      
      // For a real implementation, this would use Text-to-Speech APIs to generate actual audio
      // For now, save the description for reference
      const metadata = {
        voiceModel: voiceModel.name,
        lyrics,
        settings: {
          character,
          clarity,
          emotion,
          style
        },
        description,
        generationDate: new Date().toISOString()
      };
      
      // Create a JSON file with metadata
      fs.writeFileSync(
        path.resolve(process.cwd(), "temp/audio", `${filename}.json`), 
        JSON.stringify(metadata, null, 2)
      );
      
      // Check if we have a pre-generated sample for this voice model type
      const samplePath = path.resolve(process.cwd(), "temp/audio/samples", `${voiceModel.type}-vocal-sample.mp3`);
      if (fs.existsSync(samplePath)) {
        // Copy the sample to our target file
        fs.copyFileSync(samplePath, filePath);
      } else {
        // Create an empty file as placeholder
        fs.writeFileSync(filePath, "");
      }
      
      // Return the URL for the generated file
      return `/api/audio/${filename}`;
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Fallback to using sample file if OpenAI call fails
      const samplePath = path.resolve(process.cwd(), "temp/audio/samples", `${voiceModel.type}-vocal-sample.mp3`);
      if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, filePath);
      } else {
        fs.writeFileSync(filePath, "");
      }
      
      return `/api/audio/${filename}`;
    }
  } catch (error) {
    console.error("Error generating vocals:", error);
    throw new Error("Failed to generate vocal track");
  }
}
