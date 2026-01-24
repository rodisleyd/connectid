import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const generateBio = async (name: string, role: string, skills: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`Escreva uma biografia profissional curta e impactante (máximo 150 caracteres) para um cartão de visita digital. 
      Nome: ${name}
      Cargo: ${role}
      Habilidades/Foco: ${skills}`);
    const response = await result.response;
    return response.text()?.trim() || "Bio gerada automaticamente com IA.";
  } catch (error) {
    console.error("Erro ao gerar bio:", error);
    return "Especialista focado em resultados e inovação constante.";
  }
};

export const suggestStyle = async (role: string): Promise<any> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(`Sugira uma cor primária hexadecimal, uma cor secundária hexadecimal e um estilo de template (professional, creative, minimalist, corporate ou artistic) adequado para um profissional de: ${role}. Retorne em JSON com as chaves: primaryColor, secondaryColor, template.`);

    const response = await result.response;
    return JSON.parse(response.text() || '{}');
  } catch (error) {
    console.error("Erro ao sugerir estilo:", error);
    return { primaryColor: '#6366f1', secondaryColor: '#1e293b', template: 'professional' };
  }
};
