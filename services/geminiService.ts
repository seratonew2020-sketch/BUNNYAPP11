
import { GoogleGenAI } from "@google/genai";

// Using the provided API key from environment variables
const apiKey = import.meta.env.VITE_GOOGLE_GEN_AI_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const getSmartProductivityAdvice = async (userName: string, hoursWorked: number) => {
  try {
    // Basic Text Task: Use gemini-3-flash-preview as per documentation
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful HR and Productivity AI Coach. User ${userName} has worked ${hoursWorked} hours today.
      Provide a very short (1-2 sentences), encouraging productivity tip or work-life balance advice in Thai.
      Make it feel warm and human.`,
    });
    return response.text || "วันนี้คุณทำได้เยี่ยมมาก รักษาสมดุลชีวิตให้ดีนะ!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "สู้ๆ นะครับ วันนี้เป็นวันที่ดีสำหรับการเริ่มต้น!";
  }
};

export const analyzeWeeklyTrends = async (attendanceSummary: string) => {
  try {
    // Basic Text Task: Use gemini-3-flash-preview as per documentation
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this employee attendance summary: ${attendanceSummary}.
      Give a single concise sentence of insight in Thai (e.g. "สัปดาห์นี้คุณมาเช้าทุกวันเลย ยอดเยี่ยมมาก" or "ดูเหมือนช่วงนี้จะทำงานล่วงเวลาเยอะ อย่าลืมพักผ่อนบ้างนะ").`,
    });
    return response.text || "รักษามาตรฐานการทำงานที่ดีต่อไปนะครับ";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "รักษามาตรฐานการทำงานที่ดีต่อไปนะครับ";
  }
};
