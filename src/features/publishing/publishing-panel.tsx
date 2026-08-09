"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, Send, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";

import type { BufferConnectionStatus } from "@/lib/publishing/buffer/account";

import { publishPublication } from "./actions";
import type { PublishableRender } from "./data";

function renderLabel(render: PublishableRender) {
  const created = new Date(render.createdAt).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const type = render.renderType === "pdf" ? "PDF carrusel" : "PNG imagen";
  const pages = render.renderType === "pdf" && render.pageCount
    ? ` · ${render.pageCount} páginas`
    : "";

  return `${type}${pages} · ${created}`;
}

function successMessage(action: "publish-now" | "schedule" | "draft") {
  if (action === "draft") {
    return "Draft guardado correctamente en Buffer. No se ha publicado en LinkedIn.";
  }

  if (action === "schedule") {
    return "Publicación programada correctamente en Buffer.";
  }

  return "Buffer ha aceptado la publicación para enviarla a LinkedIn.";
}

export function PublishingPanel({
  publicationId,
  renders,
  bufferStatus,
}: {
  publicationId: string;
  renders: PublishableRender[];
  bufferStatus: BufferConnectionStatus;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [activeAction, setActiveAction] = useState<
    "publish-now" | "schedule" | "draft" | null
  >(null);
  const [lastSuccessfulAction, setLastSuccessfulAction] = useState<
    "publish-now" | "schedule" | "draft" | null
  >(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const scheduledFor = useMemo(() => {
    if (!scheduledLocal) {
      return "";
    }

    const timestamp = Date.parse(scheduledLocal);
    return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString();
  }, [scheduledLocal]);

  if (!bufferStatus.connected) {
    return (
      <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Publish
        </p>
        <h2 className="mt-3 font-semibold">Buffer pendiente de configurar</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900/75">
          La integración está implementada, pero el servidor necesita una API key válida antes de poder descubrir el canal LinkedIn o crear publicaciones.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-flex text-sm font-semibold text-amber-900 underline underline-offset-4"
        >
          Revisar conexión →
        </Link>
      </section>
    );
  }

  if (bufferStatus.linkedinChannels.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Publish
        </p>
        <h2 className="mt-3 font-semibold">No hay un canal LinkedIn disponible</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900/75">
          Buffer está conectado, pero necesitas conectar un perfil o página de LinkedIn antes de publicar.
        </p>
      </section>
    );
  }

  if (renders.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Publish
        </p>
        <h2 className="mt-3 font-semibold">Primero crea un render final</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Preview no es todavía un archivo publicable. Usa “Crear render final” y después aparecerá aquí.
        </p>
      </section>
    );
  }

  function submit(action: "publish-now" | "schedule" | "draft") {
    const form = formRef.current;

    if (!form || isPending) {
      return;
    }

    if (action === "draft" && lastSuccessfulAction === "draft") {
      setErrorMessage(
        "Ya has creado un draft en esta sesión. Revísalo en Historial antes de generar otro.",
      );
      return;
    }

    if (action === "schedule" && !scheduledFor) {
      setResultMessage(null);
      setErrorMessage("Selecciona una fecha y hora válida antes de programar.");
      return;
    }

    const formData = new FormData(form);
    formData.set("publishAction", action);
    formData.set("scheduledFor", scheduledFor);

    setActiveAction(action);
    setResultMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await publishPublication(formData);
        setLastSuccessfulAction(action);
        setResultMessage(successMessage(action));
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo completar la operación con Buffer.",
        );
      } finally {
        setActiveAction(null);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Publish
      </p>
      <h2 className="mt-3 font-semibold">Buffer → LinkedIn</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Selecciona el render y el canal. “Publicar ahora” crea una publicación real en LinkedIn a través de Buffer.
      </p>

      {resultMessage ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800" role="status">
          <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
          <span>{resultMessage}</span>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <form ref={formRef} className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <input type="hidden" name="publicationId" value={publicationId} />
        <input type="hidden" name="scheduledFor" value={scheduledFor} />

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="bufferChannel">
            Canal LinkedIn
          </label>
          <select
            id="bufferChannel"
            name="channelId"
            required
            defaultValue={bufferStatus.linkedinChannels[0]?.id}
            disabled={isPending}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm disabled:opacity-60"
          >
            {bufferStatus.linkedinChannels.map((channel) => (
              <option
                key={channel.id}
                value={channel.id}
                disabled={Boolean(channel.isDisconnected || channel.isLocked)}
              >
                {channel.displayName || channel.name} · {channel.organizationName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="publishRender">
            Render final
          </label>
          <select
            id="publishRender"
            name="renderId"
            required
            defaultValue={renders[0]?.id}
            disabled={isPending}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm disabled:opacity-60"
          >
            {renders.map((render) => (
              <option
                key={render.id}
                value={render.id}
                disabled={render.renderType === "pdf" && !render.thumbnailUrl}
              >
                {renderLabel(render)}
                {render.renderType === "pdf" && !render.thumbnailUrl
                  ? " · regenerar miniatura"
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="scheduledLocal">
            Fecha para programar
          </label>
          <input
            id="scheduledLocal"
            type="datetime-local"
            value={scheduledLocal}
            onChange={(event) => setScheduledLocal(event.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm disabled:opacity-60"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Se interpreta en la zona horaria de este navegador y se envía a Buffer en ISO 8601.
          </p>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => submit("publish-now")}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            <Send size={16} />
            {isPending && activeAction === "publish-now" ? "Publicando…" : "Publicar ahora"}
          </button>
          <button
            type="button"
            onClick={() => submit("schedule")}
            disabled={!scheduledFor || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CalendarClock size={16} />
            {isPending && activeAction === "schedule" ? "Programando…" : "Programar"}
          </button>
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={isPending || lastSuccessfulAction === "draft"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <SquarePen size={16} />
            {isPending && activeAction === "draft"
              ? "Guardando draft…"
              : lastSuccessfulAction === "draft"
                ? "Draft guardado ✓"
                : "Guardar draft en Buffer"}
          </button>
        </div>
      </form>
    </section>
  );
}
