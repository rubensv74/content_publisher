import type { DesignFamilyKey } from "@/domain/content";

export type DesignFamilyDefinition = {
  key: DesignFamilyKey;
  label: string;
  description: string;
};

export const designFamilies: DesignFamilyDefinition[] = [
  {
    key: "editorial",
    label: "Editorial",
    description: "Titulares, ideas y composiciones donde la tipografía lleva el peso principal.",
  },
  {
    key: "product",
    label: "Producto / Screenshot",
    description: "Diseños para mostrar aplicaciones, pantallas, prototipos y comparaciones visuales.",
  },
  {
    key: "technical",
    label: "Técnico",
    description: "Arquitecturas, procesos, código, diagramas y explicaciones de sistemas.",
  },
  {
    key: "data",
    label: "Data",
    description: "Métricas, KPIs, gráficos y narrativas construidas alrededor de datos.",
  },
  {
    key: "carousel",
    label: "Carrusel",
    description: "Historias multipágina para tutoriales, casos de estudio y explicaciones progresivas.",
  },
];
