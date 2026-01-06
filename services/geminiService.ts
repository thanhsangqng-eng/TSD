
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractCCCDData = async (base64Image: string): Promise<ExtractedData> => {
  // Use 'gemini-3-flash-preview' for basic text/OCR tasks as per guidelines
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Phân tích hình ảnh Thẻ Căn cước công dân (CCCD) Việt Nam này.
    Hãy trích xuất:
    1. Số CCCD (thường là 12 chữ số).
    2. Họ và tên.
    
    Trả về kết quả dưới định dạng JSON chính xác.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            idNumber: {
              type: Type.STRING,
              description: 'Số thẻ CCCD trích xuất được',
            },
            fullName: {
              type: Type.STRING,
              description: 'Họ và tên đầy đủ trên thẻ',
            },
          },
          required: ["idNumber"],
        },
      },
    });

    // The GenerateContentResponse object features a text property (not a method)
    const resultText = response.text;
    if (!resultText) throw new Error("Không nhận được phản hồi từ AI");

    return JSON.parse(resultText) as ExtractedData;
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("Không thể trích xuất dữ liệu từ ảnh. Vui lòng chụp rõ nét hơn.");
  }
};
