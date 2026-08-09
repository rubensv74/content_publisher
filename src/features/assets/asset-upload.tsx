"use client";

import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function safeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return cleaned || "image";
}

async function readImageSize(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new window.Image();
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("No se pudo leer la imagen."));
        image.src = url;
      },
    );

    return dimensions;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function AssetUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function upload(file: File) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      setErrorMessage("Usa una imagen PNG, JPG o WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("La imagen supera el límite de 10 MB.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setErrorMessage(null);

    const supabase = createClient();
    let storagePath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("La sesión ha caducado. Vuelve a iniciar sesión.");
      }

      const dimensions = await readImageSize(file);
      storagePath = `${user.id}/${crypto.randomUUID()}-${safeFilename(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("content-publisher")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
      }

      const { error: insertError } = await supabase.from("assets").insert({
        user_id: user.id,
        storage_path: storagePath,
        asset_type: "image",
        mime_type: file.type,
        original_filename: file.name,
        width: dimensions.width,
        height: dimensions.height,
        file_size: file.size,
        metadata: {
          source: "manual-upload",
        },
      });

      if (insertError) {
        await supabase.storage.from("content-publisher").remove([storagePath]);
        throw new Error(`No se pudo registrar el recurso: ${insertError.message}`);
      }

      setMessage("Recurso guardado correctamente.");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo guardar el recurso.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Nuevo recurso
          </p>
          <h2 className="mt-2 text-xl font-semibold">Subir screenshot o imagen</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Se guarda en el bucket privado. Solo se publica una copia final cuando un render la necesita.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
          <UploadCloud size={17} />
          {isUploading ? "Subiendo…" : "Elegir imagen"}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isUploading}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Formatos: PNG, JPG y WebP · máximo 10 MB.
      </p>

      {message ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
