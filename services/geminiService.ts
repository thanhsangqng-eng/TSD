
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types.ts";

// Sử dụng fallback nếu API_KEY chưa được định nghĩa
const apiKey = (window as any).process?.env?.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: apiKey });

export const extractCCCDData = async (base64Image: string): Promise<ExtractedData> => {
  if (!apiKey) {
    console.warn("Cảnh báo: API_KEY đang trống.");
  }

  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích CCCD Việt Nam, trích xuất số CCCD (12 chữ số) và Họ tên. Trả về định dạng JSON thuần.`;

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

    const text = response.text;
    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Không thể nhận diện ảnh. Vui lòng chụp rõ nét hơn.");
  }
};
