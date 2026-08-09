"use server";

import { revalidatePath } from "next/cache";

import { refreshLocalSourceSignals } from "./refresh";

export async function refreshSourceSignalsAction(_formData: FormData): Promise<void> {
  await refreshLocalSourceSignals();
  revalidatePath("/signals");
}
