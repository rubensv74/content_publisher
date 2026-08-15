import { prepareChatGPTOpportunityPacket } from "@/features/opportunities/manual";

export const dynamic = "force-dynamic";

export async function GET() {
  const packet = await prepareChatGPTOpportunityPacket();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const warning = packet.technologyRefreshWarning
    ? "\n\nNOTA\nNo se pudieron refrescar completamente las fuentes tecnológicas. El paquete se ha generado con las señales ya disponibles.\n"
    : "";
  const content = `${packet.content}${warning}\nMETADATA DEL PAQUETE\nSeñales incluidas: ${packet.signalCount}\nSeñales de foco Power Platform: ${packet.primarySignalCount}\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="content-publisher-opportunities-${stamp}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
