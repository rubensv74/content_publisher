import { SubmitButton } from "@/components/application/submit-button";
import { deleteVisualAsset } from "@/features/assets/actions";
import { AssetUpload } from "@/features/assets/asset-upload";
import { getVisualAssets } from "@/features/assets/data";

function fileSizeLabel(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AssetsPage() {
  const assets = await getVisualAssets();

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Assets
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Recursos visuales</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Guarda screenshots e imágenes una sola vez para reutilizarlos después en publicaciones y diseños. Los originales permanecen privados.
        </p>
      </header>

      <AssetUpload />

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Biblioteca
            </p>
            <h2 className="mt-2 text-xl font-semibold">Recursos guardados</h2>
          </div>
          <span className="text-sm text-[var(--muted)]">
            {assets.length} {assets.length === 1 ? "recurso" : "recursos"}
          </span>
        </div>

        {assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
            <h3 className="font-semibold">Todavía no hay recursos</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Sube el primer screenshot o imagen. Después podremos asociarlo a una publicación sin volver a cargar el archivo.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
              >
                <div
                  className="aspect-[16/10] bg-slate-100 bg-contain bg-center bg-no-repeat"
                  style={
                    asset.previewUrl
                      ? { backgroundImage: `url(${JSON.stringify(asset.previewUrl)})` }
                      : undefined
                  }
                  aria-label={`Vista previa de ${asset.original_filename}`}
                  role="img"
                />

                <div className="p-5">
                  <h3 className="truncate font-semibold" title={asset.original_filename}>
                    {asset.original_filename}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Dimensiones —"}
                    {` · ${fileSizeLabel(asset.file_size)}`}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {asset.mime_type} · {new Date(asset.created_at).toLocaleDateString("es-ES")}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {asset.previewUrl ? (
                      <a
                        href={asset.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir original ↗
                      </a>
                    ) : null}

                    <form action={deleteVisualAsset}>
                      <input type="hidden" name="assetId" value={asset.id} />
                      <SubmitButton
                        pendingLabel="Eliminando…"
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        Eliminar
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
