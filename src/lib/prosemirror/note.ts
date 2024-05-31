import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { schema } from "./schema";
import type { Note } from "$database/schema";

export function parseNote(note: Note): Node {
  const paragraph = schema.nodes.paragraph;

  const paragraphs = note.content
    .split("\n\n")
    .map((text) => paragraph.create({}, text ? schema.text(text) : []));

  const labels = note.labels.map((label) =>
    schema.nodes.label.create({ value: label }),
  );

  return schema.nodes.note.create({ id: note.id }, [...paragraphs, ...labels]);
}

/**
 * Converts a ProseMirror node to a string of content.
 *
 * For each paragraph join the text content with /n/n
 */
export function toContent(node: Node) {
  if (node.type !== schema.nodes.note) {
    throw new Error(
      `Unable to convert non-note (${node.type.name}) node to content`,
    );
  }
  let content = "";
  node.descendants((child) => {
    if (content && child.type === schema.nodes.paragraph) {
      content += "\n\n";
    }
    if (child.type === schema.nodes.text) {
      content += child.textContent;
    }
  });
  console.log("toContent", content);
  return content;
}

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
  tr.insert(insertionPos, schema.nodes.label.create({ value: label }));

  view.dispatch(tr);
}

function createTrashButton(view: EditorView, getPos: () => number | undefined) {
  const button = document.createElement("button");
  button.classList.add("trash-button");
  button.innerHTML = "🗑"; // Use a trash icon or any other suitable symbol
  button.addEventListener("click", () => {
    const pos = getPos();
    if (pos !== undefined) {
      view.dispatch(view.state.tr.delete(pos, pos + 1));
    }
  });
  return button;
}

export const labelDecorationPlugin: Plugin<DecorationSet> =
  new Plugin<DecorationSet>({
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, set) {
        set = set.map(tr.mapping, tr.doc);
        const decorations: Decoration[] = [];
        tr.doc.descendants((node, pos) => {
          if (node.type.name === "label") {
            const decoration = Decoration.widget(pos + 1, (view, getPos) =>
              createTrashButton(view, getPos),
            );
            decorations.push(decoration);
          }
        });
        return DecorationSet.create(tr.doc, decorations);
      },
    },
    props: {
      decorations(state) {
        return labelDecorationPlugin.getState(state);
      },
    },
  });
