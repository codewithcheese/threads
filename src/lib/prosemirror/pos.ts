import { EditorView } from "prosemirror-view";
import type { EditorState } from "prosemirror-state";

export function findDocumentPos(
  view: EditorView,
  left: number,
  direction: "top" | "bottom",
): number | null {
  let linePos =
    direction === "top"
      ? findFirstTextPos(view.state)
      : findLastTextPos(view.state);
  // console.log("linePos", linePos);
  if (linePos == null) return null;

  let { top } = view.coordsAtPos(linePos);
  const pos = view.posAtCoords({ left, top });

  return pos ? pos.pos : null;
}

export function findFirstTextRange(
  state: EditorState,
): { from: number; to: number } | null {
  let range: { from: number; to: number } | null = null;

  state.doc.descendants((node, pos) => {
    if (node.isText && range === null) {
      range = { from: pos, to: pos + node.nodeSize };
    }
  });

  return range;
}

export function findLastTextRange(
  state: EditorState,
): { from: number; to: number } | null {
  let range: { from: number; to: number } | null = null;

  state.doc.descendants((node, pos) => {
    if (node.isText) {
      range = { from: pos, to: pos + node.nodeSize };
    }
  });

  return range;
}

export function findFirstTextPos(state: EditorState) {
  let range = findFirstTextRange(state);
  return range ? range.from : null;
}

export function findLastTextPos(state: EditorState) {
  let range = findLastTextRange(state);
  return range ? range.to : null;
}
