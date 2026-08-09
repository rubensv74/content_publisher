"use server";

import { revalidatePath } from "next/cache";

import { reconcilePublishingJobs } from "./reconciliation";

export async function refreshPublishingStatuses(_formData: FormData): Promise<void> {
  await reconcilePublishingJobs();
  revalidatePath("/history");
  revalidatePath("/publications");
}
