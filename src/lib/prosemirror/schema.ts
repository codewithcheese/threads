import { type NodeSpec, Schema } from "prosemirror-model";
import { nanoid } from "nanoid";
import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import { Decoration } from "@codemirror/view";

// export const activeNodePlugin = new Plugin({
//   state: {
//     init() {
//       return DecorationSet.empty;
//     },
//     apply(tr, set) {
//       set = set.map(tr.mapping, tr.doc);
//       const activeNode = tr.selection.$anchor.node(1); // Get the parent node of the cursor
//       if (activeNode.type.name === "note") {
//         const decoration = Decoration.node(
//           activeNode.pos,
//           activeNode.pos + activeNode.nodeSize,
//           { class: "active-note" },
//         );
//         set = set.add(tr.doc, [decoration]);
//       } else {
//         set = set.remove(set.find());
//       }
//       return set;
//     },
//   },
//   props: {
//     decorations(state) {
//       return activeNodePlugin.getState(state);
//     },
//   },
// });

export const nodes = {
  doc: {
    content: "note*",
  } satisfies NodeSpec,

  note: {
    attrs: {
      id: { default: nanoid(10) },
    },
    content: "block* label*",
    parseDOM: [
      {
        tag: "div.note",
        getAttrs: (dom) => ({
          id: dom.id,
        }),
      },
    ],
    toDOM(node) {
      return ["div", { class: "note", id: node.attrs.id }, 0];
    },
  } satisfies NodeSpec,

  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  } satisfies NodeSpec,

  label: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "span.label" }],
    toDOM() {
      return ["span", { class: "label" }, 0];
    },
  } satisfies NodeSpec,

  text: {
    group: "inline",
  } as NodeSpec,
};

export const marks = {};

export const schema = new Schema({ nodes, marks });
