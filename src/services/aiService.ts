import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export type TransformationType = 'age_progression' | 'actor_swap' | 'background_change' | 'vintage' | 'anime';

interface TransformationOptions {
  ageGap?: number;
  gender?: 'male' | 'female';
  backgroundTheme?: 'nature' | 'hollywood' | 'futuristic' | 'cyberpunk' | 'mars';
  vintageEra?: '1920s' | '1950s' | '1970s' | '1990s';
}

export async function transformFace(base64Image: string, type: TransformationType, options: TransformationOptions): Promise<string> {
  const ai = getAI();
  
  let prompt = "";
  switch (type) {
    case 'age_progression':
      prompt = `Apply realistic age progression to this person. Make them look exactly ${options.ageGap || 40} years older than they currently appear. Maintain their fundamental facial structure, eye color, and unique features so they remain recognizable. Add wrinkles, graying hair, and skin texture consistent with advanced age.`;
      break;
    case 'actor_swap':
      prompt = `Redraw the person in this image as a world-famous ${options.gender || 'actor'} movie star. Adapt their features to look like a high-budget Hollywood film's leading role while keeping the original person's core likeness. Stylize the lighting and composition for a cinematic celebrity portrait.`;
      break;
    case 'background_change':
      prompt = `Keep the person in this image exactly as they are (pose, expression, appearance), but completely replace the background with a high-detail ${options.backgroundTheme || 'futuristic'} environment. Ensure seamless blending and consistent lighting between the subject and the new background.`;
      break;
    case 'vintage':
      prompt = `Transform this photo into a genuine ${options.vintageEra || '1950s'} vintage photograph. Apply authentic color grading, photographic grain, lens distortion, and paper texture characteristic of the era. The person should look like a historical figure in a preserved old photo.`;
      break;
    case 'anime':
      prompt = `Convert this person's face into a stunning, high-quality AI anime character version. Use a professional digital art style seen in top-tier feature-length anime films. Maintain the person's signature features (hair style, eye shape) but interpret them through stylized anime aesthetics.`;
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image: No image part returned from AI.");
}
