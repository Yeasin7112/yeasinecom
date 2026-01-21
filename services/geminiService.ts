
import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string): Promise<string> => {
  // Always use the process.env.API_KEY directly as per guidelines
  // Note: Vercel will provide this key from the environment variables you set
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `পণ্যটির নাম: "${productName}"। এই পণ্যের জন্য একটি চমৎকার আকর্ষণীয় এবং সংক্ষিপ্ত বিক্রয় উপযোগী বিবরণ (Description) বাংলা ভাষায় লিখুন। বিবরণটি ২-৩ বাক্যের মধ্যে রাখুন।`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // response.text is a property containing the generated string
    return response.text?.trim() || "কোনো বিবরণ পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "বিবরণ তৈরিতে সমস্যা হয়েছে।";
  }
};
