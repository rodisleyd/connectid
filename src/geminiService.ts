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

    const prompt = `Atue como um designer gráfico expert. Sugira um estilo visual criativo e profissional para um cartão de visita digital de um: ${role}.
    
    Retorne APENAS um JSON com as chaves:
    - primaryColor: cor hexadecimal vibrante e moderna.
    - secondaryColor: cor hexadecimal que contraste bem.
    - template: escolha entre 'professional' (clean, organizado), 'creative' (ousado, assimétrico), 'minimalist' (muito espaço branco), 'corporate' (sério, dark mode) ou 'artistic' (cores fortes).
    - borderRadius: escolha entre '0px' (quadrado/sério), '12px' (suave), '24px' (amigável) ou '99px' (moderno/pill), baseado no que combina melhor com a profissão.

    Para profissões criativas, ouse nas cores. Para corporativas, mantenha a sobriedade mas evite o tédio.`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    return JSON.parse(response.text() || '{}');
  } catch (error) {
    console.error("Erro ao sugerir estilo:", error);
    return { primaryColor: '#6366f1', secondaryColor: '#1e293b', template: 'professional', borderRadius: '12px' };
  }
};
