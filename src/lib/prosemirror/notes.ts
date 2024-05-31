import type { EditorView } from "prosemirror-view";

export function createLabelFromRange(
  view: EditorView,
  from: number,
  to: number,
) {
  const { doc, tr } = view.state;
  const { schema } = doc.type;

  if (from === to) {
    return false; // No selection, so do nothing
  }

  const label = doc.textBetween(from, to);

  // delete label input
  tr.delete(from, to);

  // Calculate the insertion position after the deletion
  const insertionPos = tr.mapping.map(from);

  // insert label
  tr.insert(insertionPos, schema.nodes.label.create(null, schema.text(label)));

  view.dispatch(tr);
}
