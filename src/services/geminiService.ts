import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ScannedLeadData {
  name: string;
  mobile: string;
  firmName: string;
  city: string;
  district: string;
  state: string;
  area: string;
}

export const scanVisitingCard = async (base64Image: string): Promise<ScannedLeadData> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Extract the following details from this visiting card image. 
            Return the data in the specified JSON format. 
            If a field is not found, leave it as an empty string.
            Fields: name, mobile (10 digits only), firmName, city, district, state, area.
            
            Note: For district and state, try to infer them if not explicitly mentioned but city is known.
            Rajasthan districts: Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner, Alwar, Bhilwara, Sikar, Pali, etc.
            `
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          mobile: { type: Type.STRING },
          firmName: { type: Type.STRING },
          city: { type: Type.STRING },
          district: { type: Type.STRING },
          state: { type: Type.STRING },
          area: { type: Type.STRING }
        },
        required: ["name", "mobile", "firmName", "city", "district", "state", "area"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as ScannedLeadData;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse visiting card data");
  }
};
