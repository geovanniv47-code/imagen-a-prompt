// ============================================
// SELECCIÓN DE TABS
// ============================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// ============================================
// SELECCIÓN DE MODELO
// ============================================
document.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.model-option').forEach(o => {
            o.classList.remove('selected');
            const check = o.querySelector('.check-icon');
            if (check) check.remove();
        });
        this.classList.add('selected');
        if (!this.querySelector('.check-icon')) {
            const check = document.createElement('div');
            check.className = 'check-icon';
            check.textContent = '✓';
            this.appendChild(check);
        }
    });
});

// ============================================
// SELECCIÓN DE VELOCIDAD
// ============================================
document.querySelectorAll('.speed-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.speed-option').forEach(o => {
            o.classList.remove('selected');
            const check = o.querySelector('.check-icon');
            if (check) check.remove();
        });
        this.classList.add('selected');
        if (!this.querySelector('.check-icon')) {
            const check = document.createElement('div');
            check.className = 'check-icon';
            check.textContent = '✓';
            this.appendChild(check);
        }
    });
});

// ============================================
// GENERAR PROMPT CON CLAUDE API
// ============================================
document.querySelector('.generate-btn').addEventListener('click', async function() {
    const input = document.querySelector('.input-text').value.trim();
    const outputBox = document.querySelector('.output-box');
    const modelName = document.querySelector('.model-option.selected .model-name').textContent;
    const speedMode = document.querySelector('.speed-option.selected .speed-name').textContent;

    if (input === '') {
        outputBox.innerHTML = '<p class="output-placeholder" style="color: #ff6b6b;">⚠️ Por favor escribe una descripción primero.</p>';
        return;
    }

    outputBox.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">✨</div>
            <p style="color: #4169e1; font-weight: 600;">Generando prompt profesional con Claude...</p>
            <p style="color: #888; font-size: 0.85rem; margin-top: 8px;">Modelo: ${modelName} | Modo: ${speedMode}</p>
        </div>
    `;

    try {
        const systemPrompt = getSystemPrompt(modelName, speedMode);
        
        // ⚠️ IMPORTANTE: Reemplaza 'sk-ant-...' con tu API KEY real de Anthropic
        const apiKey = 'sk-ant-YOUR_API_KEY_HERE'; // ← COLOCA TU API KEY AQUÍ

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey, // ← HEADER IMPORTANTE QUE FALTABA
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: `Descripción del usuario: "${input}"\n\nGenera el prompt profesional:`
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Error en la API de Anthropic');
        }

        const generatedText = data.content[0].text;

        outputBox.innerHTML = `
            <div style="text-align: left; width: 100%;">
                <div style="background: rgba(65, 105, 225, 0.1); border-left: 4px solid #4169e1; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="color: #4169e1; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">
                        📋 ${modelName} | ${speedMode}
                    </p>
                    <p style="color: #666; font-size: 0.75rem;">Prompt generado por Claude AI</p>
                </div>
                <div style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; color: #333; white-space: pre-wrap; word-break: break-word;">
                    ${escapeHtml(generatedText)}
                </div>
                <button onclick="copyPrompt()" style="margin-top: 15px; width: 100%; padding: 12px; border: none; border-radius: 10px; background: linear-gradient(135deg, #ff1493, #4169e1); color: white; font-weight: 600; cursor: pointer;">
                    📋 Copiar Prompt
                </button>
            </div>
        `;

        saveToHistory(input, generatedText, modelName);

    } catch (error) {
        console.error('Error completo:', error);
        outputBox.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #ff6b6b; font-weight: 600; margin-bottom: 10px;">❌ Error al generar</p>
                <p style="color: #888; font-size: 0.9rem;">${error.message}</p>
                <p style="color: #888; font-size: 0.8rem; margin-top: 10px;">
                    💡 Verifica que hayas agregado tu API KEY en el código.<br>
                    Obtén una en: anthropic.com/account/keys
                </p>
            </div>
        `;
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getSystemPrompt(modelName, speedMode) {
    const baseInstructions = speedMode === 'Modo Avanzado'
        ? 'Genera un prompt MUY detallado, profesional, con estilo cinematográfico, iluminación específica, composición artística, y parámetros técnicos avanzados.'
        : 'Genera un prompt detallado pero conciso, optimizado para generación rápida de imágenes.';

    const modelSpecifics = {
        'Prompt general': 'Crea un prompt versátil que funcione en cualquier modelo de IA de imagen (Midjourney, DALL-E, Stable Diffusion, Flux, etc).',
        'Nano Banana': 'Optimiza el prompt específicamente para Nano Banana, enfatizando estilos artísticos vibrantes y colores saturados.',
        'Flux': 'Optimiza para Flux AI: usa prompts en inglés, enfatiza calidad fotorealista, detalles de textura, y usa términos técnicos de Flux.',
        'Midjourney': 'Optimiza para Midjourney: incluye parámetros como --ar, --stylize, --v, usa descripciones artísticas, estilos de ilustración, y términos de composición visual.',
        'Stable Diffusion': 'Optimiza para Stable Diffusion: incluye negative prompts detallados, especifica checkpoints/LoRAs, y usa prompt weighting (paréntesis).'
    };

    return `Eres un experto en generación de prompts para IA de imágenes.

${baseInstructions}

${modelSpecifics[modelName] || modelSpecifics['Prompt general']}

REGLAS:
- Responde SOLO con el prompt generado, sin explicaciones adicionales
- El prompt debe estar en inglés (mejor para IA de imágenes)
- Incluye: sujeto, estilo, iluminación, cámara/ángulo, calidad, y negative prompt
- Formato: Prompt principal seguido de "Negative prompt:"`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyPrompt() {
    const promptEl = document.querySelector('.output-box div div:nth-child(2)');
    const promptText = promptEl ? promptEl.innerText : '';
    if (promptText) {
        navigator.clipboard.writeText(promptText).then(() => {
            const btn = document.querySelector('button[onclick="copyPrompt()"]');
            const original = btn.innerHTML;
            btn.innerHTML = '✅ ¡Copiado!';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2000);
        });
    }
}

function saveToHistory(input, prompt, model) {
    let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    history.unshift({
        input: input,
        prompt: prompt.substring(0, 100) + '...',
        model: model,
        date: new Date().toLocaleString()
    });
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('promptHistory', JSON.stringify(history));
}

document.querySelector('.historial').addEventListener('click', function() {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const outputBox = document.querySelector('.output-box');

    if (history.length === 0) {
        outputBox.innerHTML = '<p class="output-placeholder">No hay prompts en el historial aún.</p>';
        return;
    }

    let html = '<div style="text-align: left; width: 100%;"><h3 style="margin-bottom: 15px; color: #333;">📜 Historial</h3>';
    history.forEach((item) => {
        html += `
            <div style="background: rgba(255,255,255,0.4); padding: 12px; border-radius: 10px; margin-bottom: 10px; cursor: pointer;" onclick="document.querySelector('.input-text').value='${item.input.replace(/'/g, "\\'")}'; document.querySelector('.input-text').focus();">
                <p style="font-weight: 600; color: #4169e1; font-size: 0.85rem;">${item.model}</p>
                <p style="color: #555; font-size: 0.8rem; margin-top: 4px;">${item.input}</p>
                <p style="color: #888; font-size: 0.7rem; margin-top: 4px;">${item.date}</p>
            </div>
        `;
    });
    html += '</div>';
    outputBox.innerHTML = html;
});
