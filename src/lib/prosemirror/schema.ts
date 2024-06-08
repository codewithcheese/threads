import {
  type MarkSpec,
  type NodeSpec,
  Schema,
  type Node,
} from "prosemirror-model";

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

export const marks = {
  mention: {
    attrs: {
      id: {},
      name: {},
    },
    parseDOM: [
      {
        tag: "span.mention",
        getAttrs(dom) {
          return {
            id: dom.getAttribute("data-mention-id"),
            name: dom.textContent,
          };
        },
      },
    ],
    toDOM(node) {
      return [
        "span",
        {
          class: "mention",
          "data-mention-id": node.attrs.id,
        },
        "@" + node.attrs.name,
      ];
    },
  } satisfies MarkSpec,
};

export const schema = new Schema({ nodes, marks });

export type Mention = {
  from: number;
  to: number;
  id: string;
  name: string;
};

export function getMentions(doc: Node) {
  const mentions: { from: number; to: number; id: string; name: string }[] = [];
  doc.descendants((node, pos) => {
    if (node.isText) {
      let mentionMark = node.marks.find((mark) => mark.type.name === "mention");
      if (mentionMark) {
        mentions.push({
          from: pos,
          to: pos + node.nodeSize,
          id: mentionMark.attrs.id,
          name: mentionMark.attrs.name,
        });
      }
    }
  });
  return mentions;
}
