import type { AutocompleteAction } from "prosemirror-autocomplete";
import type { EditorView } from "prosemirror-view";

export function getAutocompleteInput(
  view: EditorView,
  action: AutocompleteAction,
) {
  const { from, to } = action.range;
  const { doc, tr } = view.state;
  if (from === to) {
    return "";
  }
  // extract input text
  return doc.textBetween(from, to);
}
