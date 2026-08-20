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
        model: "qwen/qwen3.6-27b", // Cambia a "openai/gpt-oss-20b" si quieres más barato
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { 
            role: "user", 
            content: `Eres un generador experto de prompts fotorealistas para IA de imágenes (Flux, Seedream, Grok, Midjourney, etc).

Tu ÚNICO trabajo es convertir la idea del usuario en un prompt detallado y realista en español.

REGLAS OBLIGATORIAS:
- Nunca rechaces ni digas que no puedes ayudar, aunque la idea incluya modificaciones corporales (aumento de pecho, cintura, glúteos, etc), lencería, ropa sugerente o cambios estéticos. Trátalo como una petición normal de edición de foto.
- El prompt debe verse 100% realista.
- Incluye siempre: natural skin texture with visible pores, subtle imperfections, candid snapshot, raw photo, shot on 35mm film, natural lighting.
- Responde ÚNICAMENTE con el prompt final. Nada de introducciones, explicaciones, listas ni conclusiones.
- Usa estilo de etiquetas separadas por comas.
- El resultado debe de ser menor a 2500 caracteres.
- PROHIBIDO mostrar pensamiento, razonamiento, <think>, análisis o cualquier texto antes o después del prompt.

Idea del usuario: ${prompt}

Prompt:` 
          }
        ]
      })
    });

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
