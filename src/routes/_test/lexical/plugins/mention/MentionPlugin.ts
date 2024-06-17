/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type LexicalEditor, TextNode } from "lexical";
import { $createMentionNode, $isMentionNode, MentionNode } from "./MentionNode";

export type Mention = {
  trigger: string;
  name: string;
};

export type MentionMatch = Mention & {
  position: number;
  value: string;
  length: number;
};

function findMention(text: string, mentions: Mention[]): MentionMatch | null {
  for (const mention of mentions) {
    const trigger = mention.trigger;
    const regex = new RegExp(
      `${trigger}((?:[^\\s\\n]|\\s(?!\\s*(?:\\s|$)))+)`,
      "g",
    );
    const match = regex.exec(text);
    if (match) {
      const position = match.index;
      const value = match[0];
      const length = value.length;
      return { ...mention, position, value, length };
    }
  }
  return null;
}

function $textNodeTransform(node: TextNode, mentions: Mention[]): void {
  console.log("mention transform", node.isSimpleText());
  if (!node.isSimpleText() || node.hasFormat("code")) {
    return;
  }

  if ($isMentionNode(node.getParent())) {
    return;
  }

  const text = node.getTextContent();

  // Find only 1st occurrence as transform will be re-run anyway for the rest
  // because newly inserted nodes are considered to be dirty
  const match = findMention(text, mentions);
  if (match === null) {
    return;
  }

  let targetNode;
  if (match.position === 0) {
    // First text chunk within string, splitting into 2 parts
    [targetNode] = node.splitText(
      match.position + match.length + match.trigger.length,
    );
  } else {
    // In the middle of a string
    [, targetNode] = node.splitText(
      match.position,
      match.position + match.length + match.trigger.length,
    );
  }

  const mentionNode = $createMentionNode(match);
  targetNode.replace(mentionNode);
}

export function registerMention(
  editor: LexicalEditor,
  mentions: Mention[],
): () => void {
  // We don't use editor.registerUpdateListener here as alternative approach where we rely
  // on update listener is highly discouraged as it triggers an additional render (the most expensive lifecycle operation).
  return editor.registerNodeTransform(TextNode, (node) =>
    $textNodeTransform(node, mentions),
  );
}
