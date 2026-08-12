"use server";

import { executeSiteCopySave } from "../../lib/site-copy-save";
import type { SiteCopySaveActionState } from "../../lib/site-copy-save-contract";

export async function saveSiteCopyAction(
  _previousState: SiteCopySaveActionState,
  formData: FormData,
): Promise<SiteCopySaveActionState> {
  return executeSiteCopySave(formData);
}
