import type { EditorView, NodeView } from "prosemirror-view";
import type { Node } from "prosemirror-model";
import { mount, unmount } from "svelte";

export class SvelteNodeView implements NodeView {
  node: Node;
  view: EditorView;
  getPos: () => number | undefined;
  dom: HTMLElement;
  mounted: any;
  props: any = $state({});
  selected: boolean;

  constructor(
    component: any,
    node: Node,
    view: EditorView,
    getPos: () => number | undefined,
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.selected = false;
    this.dom = document.createElement(node.attrs.tagName || "div");
    if (node.attrs.className) {
      this.dom.className = node.attrs.className;
    }
    this.props = { ...this.node.attrs, selected: this.selected };
    this.setDataAttrs();
    this.mounted = mount(component, {
      target: this.dom,
      props: this.props,
    });
  }

  setDataAttrs() {
    for (const [key, value] of Object.entries(this.node.attrs)) {
      this.dom.setAttribute("data-" + key, value);
    }
  }

  update(node: Node) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.props = Object.assign(this.props, this.node.attrs);

    return true;
  }

  selectNode() {
    console.log("selectNode", this.node);
    this.props.selected = true;
  }

  deselectNode() {
    console.log("deselectNode", this.node);
    this.props.selected = false;
  }

  setSelection(anchor: number, head: number, root: Document | ShadowRoot) {
    console.log("setSelection", anchor, head, root);
  }

  stopEvent(event: any) {
    return true;
  }

  ignoreMutation() {
    return true;
  }

  destroy() {
    console.log("destroy");
    unmount(this.mounted);
  }
}