"use server";

import { revalidatePath } from "next/cache";

import {
  refreshExternalSourceSignals,
  refreshLocalSourceSignals,
  refreshTechnologySourceSignals,
} from "./refresh";

export async function refreshSourceSignalsAction(_formData: FormData): Promise<void> {
  await refreshLocalSourceSignals();
  revalidatePath("/signals");
}

export async function refreshGitHubSourceSignalsAction(
  _formData: FormData,
): Promise<void> {
  await refreshExternalSourceSignals();
  revalidatePath("/signals");
}

export async function refreshTechnologySourceSignalsAction(
  _formData: FormData,
): Promise<void> {
  await refreshTechnologySourceSignals();
  revalidatePath("/signals");
}
