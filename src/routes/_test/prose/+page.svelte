<script lang="ts">
  import "prosemirror-view/style/prosemirror.css";
  import {
    EditorState,
    TextSelection,
    type Transaction,
  } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { onMount } from "svelte";
  import { nanoid } from "nanoid";
  import AutocompleteMenu from "../../(app)/thread/[slug]/AutocompleteMenu.svelte";
  import {
    autocomplete,
    type AutocompleteAction,
    closeAutocomplete,
    type FromTo,
  } from "prosemirror-autocomplete";
  import { triggers } from "../../(app)/thread/[slug]/$autocomplete";
  import { type Node, type NodeSpec, Schema, Slice } from "prosemirror-model";
  import Tag from "./Tag.svelte";
  import { SvelteNodeView } from "./SvelteNodeView.svelte";
  import { InputRule, inputRules } from "prosemirror-inputrules";

  const noteSplitRule = new InputRule(/^---$/, (state, match, start, end) => {
    console.log("noteSplitRule", state, match, start, end);
    const { tr, doc } = state;
    let stepMap = tr.mapping;

    let noteNode: Node | undefined = undefined;
    let notePos: number | null = null;

    doc.nodesBetween(start, end, (node, pos) => {
      if (node.type === schema.nodes.note) {
        noteNode = node;
        notePos = pos;
        return false; // Stop traversing
      }
    });

    if (noteNode == null || notePos == null) {
      console.log("no note", noteNode, notePos);
      return null;
    }

    // @ts-expect-error svelte incorrectly infers as never
    const contentAbove = noteNode.content.cut(0, start - 2);
    // @ts-expect-error svelte incorrectly infers as never
    const contentBelow = noteNode.content.cut(end + 1);

    console.log("content", contentAbove, contentBelow, notePos);

    tr.delete(start - 1, end + 1);

    console.log(
      "replace",
      stepMap,
      stepMap.map(notePos + 1),
      // @ts-ignore
      stepMap.map(notePos + noteNode.nodeSize - 2),
    );

    // let newNode = schema.nodes.note.create(noteNode.attrs, contentAbove);
    // tr.replaceWith(notePos!, notePos + noteNode.nodeSize - 1, newNode);

    tr.replace(
      // @ts-ignore
      stepMap.map(notePos + 1),
      // @ts-ignore
      stepMap.map(notePos + noteNode.nodeSize - 2),
      new Slice(contentAbove, 0, 0),
    );

    const separatorNode = schema.nodes.separator.create();
    // @ts-ignore
    tr.insert(stepMap.map(notePos + noteNode.nodeSize), separatorNode);

    const newNoteNode = schema.nodes.note.create(
      { id: nanoid(10) },
      contentBelow,
    );
    // @ts-ignore
    tr.insert(stepMap.map(notePos + noteNode.nodeSize), newNoteNode);

    let selection = TextSelection.create(
      tr.doc,
      // @ts-ignore
      stepMap.map(end + 1),
      // @ts-ignore
      stepMap.map(end + 1),
    );
    tr.setSelection(selection);

    return tr;
  });

  export const nodes = {
    doc: {
      content: "(note|separator)*",
    } satisfies NodeSpec,

    note: {
      attrs: {
        id: { default: nanoid(10) },
      },
      content: "block*",
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

    separator: {
      // group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["hr"];
      },
    } satisfies NodeSpec,

    tag: {
      inline: true,
      group: "inline",
      atom: true,
      // editable: false,
      attrs: {
        className: { default: "tag" },
        tagName: { default: "span" },
        value: { default: "" },
      },
      parseDOM: [
        {
          tag: "span.tag",
          getAttrs(dom) {
            return { value: dom.getAttribute("data-value") };
          },
        },
      ],
    } satisfies NodeSpec,

    text: {
      group: "inline",
    } as NodeSpec,
  };

  export const marks = {};

  export const schema = new Schema({ nodes, marks });

  let doc = schema.node("doc", null, [
    schema.node("note", { id: nanoid(10) }, [
      schema.node("paragraph", null, [schema.text("One.")]),
      schema.node("paragraph", null, [schema.text("Two!")]),
    ]),
  ]);

  let editor: HTMLDivElement = $state(null)!;
  let editorState = EditorState.create({
    doc,
    schema,
    plugins: [
      inputRules({ rules: [noteSplitRule] }),
      ...autocomplete({
        triggers,
        reducer: (action) => {
          console.log("reducer", action);
          autocompleteAction = action;
          return true;
        },
      }),
      history(),
      keymap({ "Mod-z": undo, "Mod-shift-z": redo }),
      keymap(baseKeymap),
    ],
  });
  let view: EditorView = $state(null)!;
  let autocompleteAction: AutocompleteAction | null = $state(null);

  onMount(() => {
    view = new EditorView(editor, {
      state: editorState,
      nodeViews: {
        tag: (node, view1, getPos) =>
          new SvelteNodeView(Tag, node, view1, getPos),
      },
      dispatchTransaction(transaction) {
        let newState = view.state.apply(transaction);
        view.updateState(newState);
      },
    });
  });

  function handleAutocompleteSubmit(
    type: string,
    value: string,
    range: FromTo,
  ) {
    // console.log("Autocomplete Submit", type, value);
    const tr = view.state.tr;
    tr.delete(range.from, range.to);
    closeAutocomplete(view);
    if (type === "tag") {
      insertTag(tr, value, range.from);
    }
    view.dispatch(tr);
  }

  function insertTag(tr: Transaction, tag: string, from: number) {
    console.log("insertTag", tag, from);
    tr.insert(from, schema.node("tag", { value: tag }));
  }
</script>

<div bind:this={editor} id="editor"></div>
<AutocompleteMenu
  onSubmit={handleAutocompleteSubmit}
  action={autocompleteAction}
/>
