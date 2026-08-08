import type { BufferConnectionStatus } from "@/lib/publishing/buffer/account";

export function BufferConnectionCard({
  status,
}: {
  status: BufferConnectionStatus;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Publishing
          </p>
          <h2 className="mt-2 text-xl font-semibold">Buffer → LinkedIn</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            La API key vive únicamente en el servidor. Esta pantalla solo muestra el estado de la conexión y los canales LinkedIn descubiertos.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status.connected
              ? "bg-emerald-50 text-emerald-700"
              : status.configured
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {status.connected
            ? "Conectado"
            : status.configured
              ? "Error de conexión"
              : "Sin configurar"}
        </span>
      </div>

      {!status.configured ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Añade <code className="font-semibold">BUFFER_API_KEY</code> al entorno del servidor para activar la conexión. La clave no debe tener el prefijo <code>NEXT_PUBLIC_</code>.
        </div>
      ) : null}

      {status.error ? (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.error}
        </div>
      ) : null}

      {status.connected && status.account ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Cuenta Buffer
            </p>
            <p className="mt-2 font-medium">
              {status.account.name || status.account.email}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{status.account.email}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              LinkedIn
            </p>
            <p className="mt-2 font-medium">
              {status.linkedinChannels.length} canal(es) disponible(s)
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {status.organizations.length} organización(es) detectada(s)
            </p>
          </div>
        </div>
      ) : null}

      {status.connected && status.linkedinChannels.length > 0 ? (
        <div className="mt-5 space-y-3">
          {status.linkedinChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {channel.displayName || channel.name}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {channel.organizationName} · LinkedIn
                </p>
              </div>
              <span
                className={`text-xs font-semibold ${
                  channel.isDisconnected || channel.isLocked
                    ? "text-red-600"
                    : "text-emerald-700"
                }`}
              >
                {channel.isDisconnected
                  ? "Desconectado"
                  : channel.isLocked
                    ? "Bloqueado"
                    : "Disponible"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {status.connected && status.linkedinChannels.length === 0 ? (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          La cuenta responde correctamente, pero Buffer no devuelve ningún canal LinkedIn conectado.
        </p>
      ) : null}
    </section>
  );
}
