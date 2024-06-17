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

export class TagNodeSvelte extends DecoratorNode<TagDecorator> {
  __name: string;
  __props: { name: string } = $state({ name: "" });
  __selected: boolean;

  static getType() {
    return "tag";
  }

  static clone(node: TagNodeSvelte) {
    return new TagNodeSvelte(node.__name, node.__key);
  }

  constructor(name: string, key?: string) {
    super(key);
    this.__name = name;
    this.__props = { name };
    this.__selected = false;
  }

  createDOM() {
    const dom = document.createElement("div");
    dom.className = "tag";
    return dom;
  }

  updateDOM(prevNode: TagNodeSvelte) {
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig) {
    this.__props.name = this.__name;
    return {
      component: Tag,
      props: this.__props,
    };
  }

  static importJSON(serializedNode: SerializedTagNode): TagNodeSvelte {
    return createTagNode(serializedNode.name);
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
  }
}

function createTagNode(message: string) {
  return new TagNodeSvelte(message);
}

function isTagNode(node: any) {
  return node instanceof TagNodeSvelte;
}

export { createTagNode as $createTagNode, isTagNode as $isTagNode };
