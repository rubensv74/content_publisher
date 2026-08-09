import { prepareChatGPTSuggestionPacket } from "@/features/suggestions/manual";

export const dynamic = "force-dynamic";

export async function GET() {
  const packet = await prepareChatGPTSuggestionPacket();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const warning = packet.externalRefreshWarning
    ? "\n\nNOTA\nLa lectura externa de GitHub no pudo refrescarse completamente. El paquete se ha generado con las señales disponibles.\n"
    : "";
  const content = `${packet.content}${warning}\nMETADATA DEL PAQUETE\nSeñales incluidas: ${packet.signalCount}\nSeñales enriquecidas: ${packet.enrichedCount}\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="content-publisher-chatgpt-${stamp}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
