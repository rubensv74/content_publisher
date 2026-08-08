import { SectionPlaceholder } from "@/components/application/section-placeholder";

export default function AssetsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Assets"
      title="Recursos visuales"
      description="Screenshots, imágenes, iconos y otros recursos usados por las publicaciones se gestionarán aquí y se almacenarán en Supabase Storage."
      next="Crear el bucket privado, las políticas de acceso y el primer flujo de subida y reutilización de screenshots."
    />
  );
}
