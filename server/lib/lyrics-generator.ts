import OpenAI from 'openai';

// Initialize OpenAI with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Default system prompt for lyrics generation
const DEFAULT_SYSTEM_PROMPT = `You are an expert songwriter and lyricist who can write in various musical styles. 
Generate lyrics that are creative, original, and match the requested style and mood.
Follow these guidelines:
- Create lyrics with clear verse and chorus structure
- Ensure good rhythm and flow to make them singable
- Develop consistent imagery and themes
- Use rhyme patterns appropriate to the style
- Match the vocabulary and tone to the requested style`;

interface LyricsGenerationOptions {
  prompt?: string;
  style: string;
  mood: string;
  theme?: string;
  advancedOptions?: {
    creativity: number; // 0-1
    rhymeLevel: number; // 0-1
    verseCount?: number; // Number of verses
    includePreChorus?: boolean;
    includeBridge?: boolean;
    rhymePattern?: string; // e.g., "AABB", "ABAB", etc.
  };
}

export interface LyricsStructureResponse {
  title: string;
  structure: {
    intro?: string;
    verse1: string;
    preChorus1?: string;
    chorus: string;
    verse2?: string;
    preChorus2?: string;
    bridge?: string;
    outro?: string;
  };
  fullLyrics: string;
  metadata: {
    theme: string;
    mood: string;
    style: string;
    estimatedDuration: string;
    rhymeScheme: string;
    suggestedChords?: string[];
  };
}

export interface LyricsSuggestionResponse {
  original: string;
  suggestions: string[];
  explanation: string;
}

export interface LyricsRhymeResponse {
  words: string[];
  soundsLike: string[];
  explanation: string;
}

/**
 * Generate lyrics using OpenAI
 */
export async function generateLyrics(options: LyricsGenerationOptions): Promise<string> {
  const { prompt, style, mood, theme, advancedOptions } = options;
  
  // Determine style-specific instructions
  let styleInstructions = '';
  switch (style.toLowerCase()) {
    case 'rap':
      styleInstructions = 'Use strong rhythm, flow, and wordplay. Include internal rhymes and metaphors.';
      break;
    case 'pop':
      styleInstructions = 'Create catchy, memorable hooks with relatable themes. Keep verses concise.';
      break;
    case 'rnb':
      styleInstructions = 'Focus on smooth delivery, emotional depth, and subtle wordplay.';
      break;
    case 'rock':
      styleInstructions = 'Create powerful, energetic lyrics with strong imagery.';
      break;
    case 'edm':
      styleInstructions = 'Focus on repetitive, catchy phrases that work well with electronic music.';
      break;
    case 'soul':
      styleInstructions = 'Express deep emotion, passion, and authenticity.';
      break;
    default:
      styleInstructions = 'Write in a natural, authentic style.';
  }
  
  // Temperature affects randomness/creativity (0.7 is a good default, higher = more random)
  const temperature = advancedOptions ? 0.5 + (advancedOptions.creativity * 0.9) : 0.7;
  
  // Build the user prompt
  let userPrompt = prompt || `Write ${style} lyrics with a ${mood} mood`;
  if (theme) {
    userPrompt += ` about ${theme}`;
  }
  
  userPrompt += `\n\nStyle specifics: ${styleInstructions}`;
  
  if (advancedOptions) {
    const rhymeEmphasis = advancedOptions.rhymeLevel > 0.7 ? 'strong' : advancedOptions.rhymeLevel > 0.4 ? 'moderate' : 'light';
    userPrompt += `\n\nUse ${rhymeEmphasis} rhyme schemes.`;
    
    if (advancedOptions.verseCount) {
      userPrompt += `\n\nInclude ${advancedOptions.verseCount} verses.`;
    }
    
    if (advancedOptions.includePreChorus) {
      userPrompt += `\n\nInclude a pre-chorus section.`;
    }
    
    if (advancedOptions.includeBridge) {
      userPrompt += `\n\nInclude a bridge section.`;
    }
    
    if (advancedOptions.rhymePattern) {
      userPrompt += `\n\nFollow the rhyme pattern: ${advancedOptions.rhymePattern}`;
    }
  }
  
  // Make the OpenAI API call
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: temperature,
      max_tokens: 700
    });
    
    // Extract and return the generated lyrics
    return response.choices[0].message.content || '';
    
  } catch (error) {
    console.error('Error generating lyrics with OpenAI:', error);
    throw new Error('Failed to generate lyrics. Please try again.');
  }
}

/**
 * Generate structured lyrics with explicit sections
 */
export async function generateStructuredLyrics(options: LyricsGenerationOptions): Promise<LyricsStructureResponse> {
  const { prompt, style, mood, theme, advancedOptions } = options;
  
  const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}
Additionally, you will output lyrics with clear, labeled structure components.
Return a JSON response with the following format:
{
  "title": "Song Title",
  "structure": {
    "intro": "...",
    "verse1": "...",
    "preChorus1": "...",
    "chorus": "...",
    "verse2": "...",
    "preChorus2": "...",
    "bridge": "...",
    "outro": "..."
  },
  "fullLyrics": "...",
  "metadata": {
    "theme": "...",
    "mood": "...",
    "style": "...",
    "estimatedDuration": "...", 
    "rhymeScheme": "...",
    "suggestedChords": ["C", "G", "Am", "F"]
  }
}

Not all sections are required - only create those that make sense for the style and prompt.`;

  // Build the user prompt similarly to the regular generateLyrics method
  let userPrompt = prompt || `Write ${style} lyrics with a ${mood} mood`;
  if (theme) {
    userPrompt += ` about ${theme}`;
  }
  
  // Add specific instructions based on style, advanced options, etc.
  // (Similar to generateLyrics method)
  
  userPrompt += "\n\nProvide the response in the JSON format specified.";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: advancedOptions?.creativity ? 0.5 + (advancedOptions.creativity * 0.9) : 0.7,
      max_tokens: 1500
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }
    
    return JSON.parse(content) as LyricsStructureResponse;
    
  } catch (error) {
    console.error('Error generating structured lyrics:', error);
    throw new Error('Failed to generate structured lyrics. Please try again.');
  }
}

/**
 * Get alternative lyric suggestions for a specific line
 */
export async function getLyricSuggestions(
  line: string, 
  fullLyrics: string, 
  style: string,
  count: number = 3
): Promise<LyricsSuggestionResponse> {
  const systemPrompt = `You are an expert songwriter who helps improve lyrics.
Given a specific line and its context within full lyrics, provide a few alternative suggestions.
Return a JSON response with:
{
  "original": "The original line",
  "suggestions": ["Alternative 1", "Alternative 2", ...],
  "explanation": "Brief explanation of the changes and what makes them stronger"
}`;

  const userPrompt = `Here are the full lyrics for context:
${fullLyrics}

I want to improve this specific line:
"${line}"

Please provide ${count} alternative suggestions for this line that:
1. Maintain the same approximate syllable count and rhythm
2. Fit the ${style} style
3. Match the context and meaning in the song
4. Potentially improve the rhyme, imagery, or impact`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }
    
    return JSON.parse(content) as LyricsSuggestionResponse;
    
  } catch (error) {
    console.error('Error generating lyric suggestions:', error);
    throw new Error('Failed to generate suggestions. Please try again.');
  }
}

/**
 * Find rhyming words for a given word or phrase
 */
export async function findRhymes(word: string, style: string): Promise<LyricsRhymeResponse> {
  const systemPrompt = `You are an expert songwriter who helps with finding rhymes for lyrics.
Given a word or phrase, provide rhyming words that would work well in lyrics.
Return a JSON response with:
{
  "words": ["word1", "word2", ...],
  "soundsLike": ["similar1", "similar2", ...],
  "explanation": "Brief note about the sound patterns"
}

For "words", include perfect and near-perfect rhymes.
For "soundsLike", include words with similar consonant patterns or assonance.`;

  const userPrompt = `Find rhymes for "${word}" that would work well in ${style} lyrics.
Provide at least 10 options if possible, prioritizing words that would fit naturally in this musical style.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }
    
    return JSON.parse(content) as LyricsRhymeResponse;
    
  } catch (error) {
    console.error('Error finding rhymes:', error);
    throw new Error('Failed to find rhymes. Please try again.');
  }
}