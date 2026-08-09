"use server";

import { revalidatePath } from "next/cache";

import { reconcilePublishingJobs } from "./reconciliation";

export async function refreshPublishingStatuses(_formData: FormData) {
  const summary = await reconcilePublishingJobs();
  revalidatePath("/history");
  revalidatePath("/publications");

  return summary;
}
