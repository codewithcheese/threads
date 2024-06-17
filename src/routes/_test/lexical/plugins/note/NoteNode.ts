import type { NodeKey, SerializedElementNode } from "lexical";
import { type EditorConfig, ElementNode, type Spread } from "lexical";

export type SerializedNoteNode = Spread<
  {
    id: string;
  },
  SerializedElementNode
>;

/**
 * A note node is a top-level container for text and other nodes.
 * A note has a unique id which is used as the primary key for the note in the database.
 * When a note is created or modified it is serialized and upserted into the database.
 * When a note is deleted, its is removed from the database.
 */
export class NoteNode extends ElementNode {
  __id: string;

  static getType() {
    return "note";
  }
  static clone(node: NoteNode) {
    return new NoteNode(node.__id, node.__key);
  }

  get id() {
    return this.getLatest().__id;
  }

  constructor(id: string, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("div");
    element.setAttribute("data-id", this.__id);
    element.classList.add("note-node");
    return element;
  }

  updateDOM(prevNode: NoteNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    return $createNoteNode(serializedNode.id);
  }

  exportJSON(): SerializedNoteNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      type: "note",
    };
  }

  excludeFromCopy(destination?: "clone" | "html"): boolean {
    return true;
  }

  canIndent(): boolean {
    return false;
  }
}

export function $createNoteNode(id: string) {
  return new NoteNode(id);
}
