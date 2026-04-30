import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
// Note: process.env.GEMINI_API_KEY is provided by the platform.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getGenAI = () => ai;

export async function summarizeNotice(rawText: string) {
  const prompt = `
    다음은 학급 공지사항입니다. 이를 '정보의 효율적 전달'을 목적으로 딱 3줄(혹은 4개 항목)으로 요약해주세요.
    반드시 다음 형식을 지켜주세요:
    📍 일시: [내용]
    🏫 장소: [내용]
    🎒 준비물: [내용]
    ✅ 할 일: [내용]

    공지사항 내용:
    ${rawText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "요약에 실패했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function refineNotice(noticeText: string) {
  const prompt = `
    당신은 친절하고 꼼꼼한 학급 담임 선생님입니다. 
    선생님이 대충 적은 공지사항 초안을 바탕으로, 학생들이 이해하기 쉽고 꼼꼼하게 다듬어진 공지사항을 작성해주세요.
    
    [규칙]
    1. 말투는 친절하고 다정하게 (예: ~해요, ~해줘요)
    2. 중요한 부분은 강조하거나 이모지를 적절히 사용
    3. 구체적인 행동 강령이나 팁을 추가하여 꼼꼼하게 작성
    4. 너무 길지 않게 핵심을 짚어줄 것
    
    [초안 내용]
    ${noticeText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "공지 다듬기에 실패했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
