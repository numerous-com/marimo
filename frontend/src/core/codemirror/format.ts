/* Copyright 2024 Marimo. All rights reserved. */

import type { EditorView } from "@codemirror/view";
import type { CellId } from "../cells/ids";
import { Objects } from "../../utils/objects";
import { sendFormat } from "../network/requests";
import { type CellActions, getNotebook } from "../cells/cells";
import { notebookCellEditorViews } from "../cells/utils";
import {
  getEditorCodeAsPython,
  updateEditorCodeFromPython,
} from "./language/utils";
import { StateEffect } from "@codemirror/state";
import { getUserConfig } from "../config/config";

export const formattingChangeEffect = StateEffect.define<boolean>();

/**
 * Format the code in the editor views via the marimo server,
 * and update the editor views with the formatted code.
 */
export async function formatEditorViews(
  views: Record<CellId, EditorView>,
  updateCellCode: CellActions["updateCellCode"],
) {
  const codes = Objects.mapValues(views, (view) => getEditorCodeAsPython(view));

  const formatResponse = await sendFormat({
    codes,
    lineLength: getUserConfig().formatting.line_length,
  });

  for (const [_cellId, formattedCode] of Objects.entries(
    formatResponse.codes,
  )) {
    const cellId = _cellId as CellId;
    const originalCode = codes[cellId];
    const view = views[cellId];

    if (!view) {
      continue;
    }

    // Only update the editor view if the formatted code is different
    // from the original code
    if (formattedCode === originalCode) {
      continue;
    }

    updateCellCode({ cellId, code: formattedCode, formattingChange: true });
    updateEditorCodeFromPython(view, formattedCode);
  }
}

/**
 * Format all cells in the notebook.
 */
export function formatAll(updateCellCode: CellActions["updateCellCode"]) {
  const views = notebookCellEditorViews(getNotebook());
  return formatEditorViews(views, updateCellCode);
}
