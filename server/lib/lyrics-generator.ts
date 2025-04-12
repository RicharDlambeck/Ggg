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
  };
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