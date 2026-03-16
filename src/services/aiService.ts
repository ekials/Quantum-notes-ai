import { AI_SYSTEM_PROMPT } from '../utils/constants';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function sendMessage(
  messages: ChatMessage[],
  notesContext?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    // Return a mock response if no API key configured
    return getMockResponse(messages[messages.length - 1]?.content ?? '');
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content: notesContext
      ? `${AI_SYSTEM_PROMPT}\n\n---\nCONTEXTO DE NOTAS DEL USUARIO:\n${notesContext}`
      : AI_SYSTEM_PROMPT,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    return data.choices[0]?.message?.content ?? 'Sin respuesta del servidor.';
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return `❌ Error al conectar con la IA: ${msg}\n\nVerifica tu clave de API en el archivo .env`;
  }
}

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('kaist') || lower.includes('master')) {
    return '🎯 ¡Excelente objetivo! Para llegar a KAIST necesitas enfocarte en tres áreas clave:\n\n1. **GPA**: Mantener sobre 16/20 en los próximos semestres\n2. **Investigación**: Publicar al menos un paper en tu área de interés (quantum computing o algorithms)\n3. **Idioma**: TOPIK 6 es fundamental — empieza con 30 min diarios\n\n¿En cuál de estas áreas quieres profundizar hoy? 💪';
  }

  if (lower.includes('algoritmo') || lower.includes('dp') || lower.includes('grafo')) {
    return '💻 Para mejorar en algoritmos en Codeforces:\n\n**Plan semanal sugerido:**\n- Lun/Mié/Vie: 2 problemas Div2 (A+B rápidos + 1 C)\n- Mar/Jue: Estudiar 1 tema nuevo (DP, grafos, etc.)\n- Sáb: Virtual contest\n- Dom: Revisión y notas\n\n¿Cuál es tu problema más frecuente? ¿Time Limit o Wrong Answer? 🤔';
  }

  if (lower.includes('quantum') || lower.includes('qubits')) {
    return '⚛️ El Quantum Computing es fascinante. Para empezar:\n\n1. **Nielsen & Chuang** - "Quantum Computation and Quantum Information" (la biblia)\n2. **Qiskit** - Framework de IBM, gratuito y con tutoriales excelentes\n3. **arXiv:quant-ph** - Papers actuales\n\nComienza con los principios de superposición y entrelazamiento. ¿Tienes base en álgebra lineal? 📚';
  }

  if (lower.includes('codeforces') || lower.includes('rating')) {
    return '📈 Para subir de 1250 a 2000 en Codeforces:\n\n**Roadmap:**\n- 1250→1400: Dominar DP básica, BFS/DFS, implementación\n- 1400→1600: Grafos avanzados, DP con optimizaciones\n- 1600→1800: Segment trees, Fenwick, math\n- 1800→2000: Advanced DP, flows, competitive geometry\n\n¡Practica consistentemente! 100 problemas al mes mínimo. 🔥';
  }

  return '🤖 ¡Hola! Soy Quantum AI, tu asistente académico. Puedo ayudarte con:\n\n- 💻 Algoritmos y Competitive Programming\n- ⚛️ Quantum Computing\n- 📚 Planes de estudio\n- 🇰🇷 Preparación para KAIST\n- 📝 Revisión de notas\n\n⚙️ *Nota: Para respuestas con IA real, configura tu `VITE_OPENAI_API_KEY` en el archivo `.env`*\n\n¿En qué te puedo ayudar hoy? 🚀';
}
