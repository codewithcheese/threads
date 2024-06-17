import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import Tag from "./Tag.svelte";

export type SerializedTagNode = Spread<
  {
    name: string;
  },
  SerializedLexicalNode
>;

type TagDecorator = {
  component: typeof Tag;
  props: { name: string };
};

export class TagNode extends DecoratorNode<TagDecorator> {
  __name: string;
  __selected: boolean;

  static getType() {
    return "tag";
  }

  static clone(node: TagNode) {
    return new TagNode(node.__name, node.__key);
  }

  constructor(name: string, key?: string) {
    super(key);
    this.__name = name;
    this.__selected = false;
  }

  createDOM() {
    const dom = document.createElement("div");
    dom.className = "tag";
    return dom;
  }

  updateDOM(prevNode: TagNode) {
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig) {
    return {
      component: Tag,
      props: {
        name: this.__name,
      },
    };
  }

  static importJSON(serializedNode: SerializedTagNode): TagNode {
    return $createTagNode(serializedNode.name);
  }

  exportJSON(): SerializedTagNode {
    return {
      name: this.__name,
      type: "tag",
      version: 1,
    };
  }

  remove(preserveEmptyParent?: boolean) {
    super.remove(preserveEmptyParent);
    console.log("remove", this.__name);
  }
}

export function $createTagNode(message: string) {
  return new TagNode(message);
}

export function $isTagNode(node: any) {
  return node instanceof TagNode;
}
