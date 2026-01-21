
import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string): Promise<string> => {
  // Ensure process.env is accessible, or provide empty string
  const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing in environment variables.");
    return "বিবরণ তৈরিতে সমস্যা হয়েছে (API Key missing)।";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `পণ্যটির নাম: "${productName}"। এই পণ্যের জন্য একটি চমৎকার আকর্ষণীয় এবং সংক্ষিপ্ত বিক্রয় উপযোগী বিবরণ (Description) বাংলা ভাষায় লিখুন। বিবরণটি ২-৩ বাক্যের মধ্যে রাখুন।`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text?.trim() || "কোনো বিবরণ পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "বিবরণ তৈরিতে সমস্যা হয়েছে।";
  }
};
