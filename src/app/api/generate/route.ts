import { groq, MODEL } from "../../../../lib/groq";

export const runtime = "edge";

export async function POST(req: Request) {
  const { jobDescription, userProfile } = await req.json();

  if (!jobDescription || !userProfile) {
    return new Response("Faltan campos requeridos", { status: 400 });
  }

  const stream = await groq.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [
      {
        role: "system",
        content: `Eres un experto redactor de cartas de presentación profesionales en español. 
Tu tarea es crear cartas personalizadas, auténticas y convincentes que conecten el perfil del candidato con los requisitos del puesto.
La carta debe:
- Tener un tono profesional pero humano
- Destacar logros concretos y relevantes
- Mostrar conocimiento del rol y la empresa
- Tener 3-4 párrafos bien estructurados
- Comenzar con una apertura memorable
- Terminar con un llamado a la acción claro
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
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}