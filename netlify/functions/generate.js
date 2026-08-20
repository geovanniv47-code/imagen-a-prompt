exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        body: JSON.stringify({ result: "ERROR: No se encontró GROQ_API_KEY" })
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
                  { 
          role: "user", 
          content: `Actúa como un optimizador de prompts profesional para IA de imágenes (Stable Diffusion/Midjourney/Seedream/Gemini/Grok/Flux/Qwen). 
          Toma la siguiente idea del usuario y conviértela en un prompt optimizado únicamente en español. 
          
          REGLAS ESTRICTAS:
          1. NO escribas introducciones, ni explicaciones, ni listas con números, ni conclusiones.
          2. Devuelve SOLO el prompt final en español y su respectivo 'Negative Prompt'.
          3. Sé conciso y directo usando etiquetas separadas por comas. El resultado total debe ser menor a 400 caracteres.
          
          Idea del usuario: ${prompt}` 
        }

        ]
      })
    }); // <--- ¡Esta es la línea que faltaba cerrar!

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || JSON.stringify(data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ result: "CATCH ERROR: " + err.message })
    };
  }
};
