
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const generateBio = async (name: string, role: string, skills: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Escreva uma biografia profissional curta e impactante (máximo 150 caracteres) para um cartão de visita digital. 
      Nome: ${name}
      Cargo: ${role}
      Habilidades/Foco: ${skills}`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text?.trim() || "Bio gerada automaticamente com IA.";
  } catch (error) {
    console.error("Erro ao gerar bio:", error);
    return "Especialista focado em resultados e inovação constante.";
  }
};

export const suggestStyle = async (role: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Sugira uma cor primária hexadecimal, uma cor secundária hexadecimal e um estilo de template (professional, creative, minimalist, corporate ou artistic) adequado para um profissional de: ${role}. Retorne em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            template: { type: Type.STRING }
          }
        }
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { primaryColor: '#6366f1', secondaryColor: '#1e293b', template: 'professional' };
  }
};
