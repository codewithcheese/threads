import { Node } from "prosemirror-model";
import { schema } from "./schema";

export function parseContent(content: string, labels: string[]) {
  const paragraph = schema.nodes.paragraph;

  let nodes: Node[] = [];
  let paragraphs = content
    .split("\n\n")
    .map((text) => paragraph.create({}, text ? schema.text(text) : []));
  nodes = nodes.concat(paragraphs);

  // add labels
  labels.forEach((label) => {
    nodes.push(schema.nodes.label.create({}, schema.text(label)));
  });

  console.log("parseContent", nodes);
  return nodes;
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
      const isFirst = content === "";
      content += child.textContent;
      if (!isFirst) {
        content += "\n\n";
      }
    }
  });
  console.log("toContent", content);
  return content;
}
