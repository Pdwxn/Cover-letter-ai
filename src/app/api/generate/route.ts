import { groq, MODEL } from "../../../../lib/groq";
import { checkRateLimit } from "../../../../lib/rate-limits";

export const runtime = "edge";

const MIN_LENGTH = 50;

const TONE_PROMPTS: Record<string, string> = {
  formal: `Usa un tono formal y profesional. Lenguaje cuidado, estructura clásica, vocabulario elevado.`,
  creativo: `Usa un tono creativo y memorable. Abre con una frase impactante, muestra personalidad y diferénciate del resto.`,
  conciso: `Usa un tono directo y conciso. Máximo 3 párrafos cortos. Ve al punto, sin relleno.`,
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return new Response("Límite de requests alcanzado. Espera un minuto.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const { jobDescription, userProfile, tone = "formal" } = await req.json();

  if (!jobDescription || !userProfile) {
    return new Response("Faltan campos requeridos.", { status: 400 });
  }

  if (jobDescription.length < MIN_LENGTH || userProfile.length < MIN_LENGTH) {
    return new Response(
      `Cada campo debe tener al menos ${MIN_LENGTH} caracteres para generar una carta de calidad.`,
      { status: 422 }
    );
  }

  const toneInstruction = TONE_PROMPTS[tone] ?? TONE_PROMPTS.formal;

  const stream = await groq.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [
      {
        role: "system",
        content: `Eres un experto redactor de cartas de presentación profesionales en español.
Tu tarea es crear cartas personalizadas, auténticas y convincentes.
${toneInstruction}
La carta debe destacar logros concretos, conectar el perfil con el rol y terminar con un llamado a la acción.
Responde SOLO con la carta, sin explicaciones adicionales.`,
      },
      {
        role: "user",
        content: `Oferta de trabajo:\n${jobDescription}\n\nMi perfil profesional:\n${userProfile}`,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}