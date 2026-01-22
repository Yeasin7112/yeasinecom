
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  const config = (window as any).APP_CONFIG;
  if (config && config.API_KEY) return config.API_KEY;
  return (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
};

export const generateProductDescription = async (productName: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("Gemini API Key missing.");
    return "বিবরণ তৈরিতে সমস্যা হয়েছে (API Key missing)।";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `পণ্যটির নাম: "${productName}"। এই পণ্যের জন্য একটি চমৎকার আকর্ষণীয় এবং সংক্ষিপ্ত বিক্রয় উপযোগী বিবরণ (Description) বাংলা ভাষায় লিখুন। বিবরণটি ২-৩ বাক্যের মধ্যে রাখুন।`,
    });

    return response.text?.trim() || "কোনো বিবরণ পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "বিবরণ তৈরিতে সমস্যা হয়েছে।";
  }
};
