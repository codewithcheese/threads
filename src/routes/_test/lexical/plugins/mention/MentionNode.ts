/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";
import { TextNode } from "lexical";
import type { MentionMatch } from "./MentionPlugin";

export type SerializedMentionNode = Spread<
  {
    match: MentionMatch;
  },
  SerializedTextNode
>;

export class MentionNode extends TextNode {
  __match: MentionMatch;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__match, node.__key);
  }

  constructor(match: MentionMatch, key?: NodeKey) {
    super(match.value, key);
    this.__match = match;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("span");
    dom.className = "mention";
    dom.innerText = this.__text;
    return dom;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.match);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: "mention",
      match: this.__match,
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return true;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createMentionNode(match: MentionMatch): MentionNode {
  return new MentionNode(match).setMode("normal");
}

export function $isMentionNode(node: any): node is MentionNode {
  return node instanceof MentionNode;
}
