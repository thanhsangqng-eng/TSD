
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractCCCDData = async (base64Image: string): Promise<ExtractedData> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `Phân tích CCCD Việt Nam, trích xuất số CCCD và Họ tên. Trả về JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            idNumber: { type: Type.STRING },
            fullName: { type: Type.STRING },
          },
          required: ["idNumber"],
        },
      },
    });

    return JSON.parse(response.text) as ExtractedData;
  } catch (error) {
    throw new Error("Không thể nhận diện ảnh. Hãy chụp rõ hơn.");
  }
};
