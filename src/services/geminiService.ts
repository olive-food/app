import { GoogleGenAI } from "@google/genai";
import { SurveyResponse } from "../types";

// In a real app, do not expose API Key in frontend code like this if possible.
// For this demo, we assume the environment variable is injected.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeFeedback = async (surveys: SurveyResponse[]): Promise<string> => {
  if (!API_KEY) return "API Key chưa được cấu hình. Không thể phân tích bằng AI.";
  if (surveys.length === 0) return "Chưa có dữ liệu khảo sát để phân tích.";

  const comments = surveys
    .filter(s => s.comment && s.comment.trim().length > 0)
    .map(s => `- ${s.comment} (Điểm chất lượng: ${s.foodQuality}/5)`)
    .join('\n');

  if (!comments) return "Không có bình luận chi tiết để phân tích.";

  try {
    const prompt = `
      Bạn là một chuyên gia quản lý chất lượng bếp ăn công nghiệp.
      Dưới đây là danh sách các phản hồi từ khách hàng hôm nay:
      ${comments}

      Hãy tóm tắt ngắn gọn (dưới 150 từ) về:
      1. Các điểm mạnh được khen ngợi.
      2. Các vấn đề cần khắc phục gấp.
      3. Đề xuất cải thiện thực đơn ngày mai.
      
      Trả lời bằng tiếng Việt, giọng văn chuyên nghiệp.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể tạo phân tích.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI để phân tích.";
  }
};