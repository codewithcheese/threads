import { type NodeSpec, Schema } from "prosemirror-model";

export const nodes = {
  doc: {
    content: "block+",
  } satisfies NodeSpec,

  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  } satisfies NodeSpec,

  text: {
    group: "inline",
  } as NodeSpec,
};

export const marks = {};

export const schema = new Schema({ nodes, marks });
