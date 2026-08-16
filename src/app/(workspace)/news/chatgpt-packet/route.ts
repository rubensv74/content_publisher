import { prepareChatGPTNewsPacket } from "@/features/news/manual";

export const dynamic = "force-dynamic";

export async function GET() {
  const packet = await prepareChatGPTNewsPacket();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const content = `${packet.content}\nMETADATA DEL PAQUETE\nSeñales incluidas: ${packet.signalCount}\nPower Apps: ${packet.streamCounts.powerApps}\nPower BI: ${packet.streamCounts.powerBi}\nIA aplicada: ${packet.streamCounts.aiApplied}\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="content-publisher-news-${stamp}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
