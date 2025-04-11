import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ImageAnalysisOptions {
  imagePath: string;
  creativityLevel: string;
  excitementLevel: string;
  jinnification: boolean;
}

export async function analyzeImage(options: ImageAnalysisOptions): Promise<string> {
  const { imagePath, creativityLevel, excitementLevel, jinnification } = options;
  
  try {
    // Read image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Create the prompt
    let prompt = `Fra et kunstnerisk perspektiv, forsøk å beskrive det artistiske snitt som bildet ikke får frem uten ord, kom opp med en liten beskrivelse som er en reise fra utsiden av bildet og inn i bildet. Spenningen skal være ${excitementLevel}, kreativiteten skal være ${creativityLevel}.`;
    
    // Add jinnification if requested
    if (jinnification) {
      prompt += " Avslutt historien med å legge til Jenni ei fiksert jente som fikser bildet.";
    }
    
    // Create the system prompt
    const systemPrompt = "Du er en kunstnerisk assistent som analyserer bilder og skaper kreative beskrivelser på norsk. Fokuser på å skape en interessant 'reise' fra utsiden og inn i bildet som matcher de angitte kreativitets- og spenningsnivåene.";
    
    // Send request to Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error("Error analyzing image with Anthropic:", error);
    throw new Error(`Kunne ikke analysere bildet: ${error.message}`);
  }
}

// Helper function to get creativity level description
export function getCreativityLevelDescription(value: number): string {
  if (value <= 25) return "lav";
  if (value <= 50) return "middels";
  if (value <= 75) return "høy";
  return "ekstrem";
}

// Helper function to get excitement level description
export function getExcitementLevelDescription(value: number): string {
  if (value <= 25) return "lav";
  if (value <= 50) return "middels";
  if (value <= 75) return "høy";
  return "ekstrem";
}