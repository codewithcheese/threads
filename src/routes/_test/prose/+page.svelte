<script lang="ts">
  import "prosemirror-view/style/prosemirror.css";
  // import { schema } from "prosemirror-schema-basic";
  import {
    Schema,
    type NodeSpec,
    type MarkSpec,
    type DOMOutputSpec,
    Slice,
  } from "prosemirror-model";
  import { EditorState } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { undo, redo, history } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { onMount } from "svelte";
  import { nanoid } from "nanoid";
  import { Button } from "$components/ui/button";
  import { Transform } from "prosemirror-transform";
  import {
    ActionKind,
    autocomplete,
    type AutocompleteAction,
    type Options,
  } from "prosemirror-autocomplete";
  import { reducer } from "./reducer";
  import Command from "./Command.svelte";

  let command: { open: boolean; filter: string | undefined } = $state({
    open: false,
    filter: undefined,
  });

  function autocompleteReducer(action: AutocompleteAction) {
    console.log("autocompleteReducer", action);
    command.filter = action.filter;
    switch (action.kind) {
      case ActionKind.open:
        command.open = true;
        return true;
      case ActionKind.close:
        command.open = false;
        return true;
      case ActionKind.up:
        return true;
      case ActionKind.down:
        return true;
      case ActionKind.enter: {
        command.open = false;
        return true;
      }
      default:
        return false;
    }
  }

  const pDOM: DOMOutputSpec = ["p", 0];

  const autocompleteOptions: Options = {
    triggers: [
      { name: "hashtag", trigger: "#", cancelOnFirstSpace: true },
      { name: "mention", trigger: "@" },
    ],
    reducer: autocompleteReducer,
  };

  /// [Specs](#model.NodeSpec) for the nodes defined in this schema.
  const nodes = {
    /// NodeSpec The top level document node.
    doc: {
      content: "note+",
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

    /// A plain paragraph textblock. Represented in the DOM
    /// as a `<p>` element.
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return pDOM;
      },
    } satisfies NodeSpec,

    text: {
      group: "inline",
    } as NodeSpec,
  };

  export const marks = {};

  export const schema = new Schema({ nodes, marks });

  // (The null arguments are where you can specify attributes, if necessary.)
  let doc = schema.node("doc", null, [
    schema.node("note", null, [
      schema.node("paragraph", null, [schema.text("One.")]),
      schema.node("paragraph", null, [schema.text("Two!")]),
    ]),
  ]);

  let editor: HTMLDivElement = $state(null)!;
  let editorState = EditorState.create({
    doc,
    schema,
    plugins: [
      ...autocomplete(autocompleteOptions),
      history(),
      keymap({ "Mod-z": undo, "Mod-shift-z": redo }),
      keymap(baseKeymap),
    ],
  });
  let view: EditorView = $state(null)!;

  onMount(() => {
    view = new EditorView(editor, {
      state: editorState,
      dispatchTransaction(transaction) {
        console.log(
          "Document size went from",
          transaction.before.content.size,
          "to",
          transaction.doc.content.size,
        );
        let newState = view.state.apply(transaction);
        view.updateState(newState);
      },
    });
  });

  function handleTransaction() {
    const doc = view.state.doc;
    console.log("size", doc.content.size);
    console.log(doc.toString()); // The current document
    console.log(doc.textContent);

    const slice = new Slice(doc.content, 0, doc.content.size);
    console.log(slice.toJSON());

    let slice1 = doc.slice(2, 10);
    console.log(slice1.toJSON());

    let tr = new Transform(view.state.doc);
    tr.delete(3, 5); // Delete between position 5 and 7
    tr.split(9); // Split the parent node at position 5
    console.log(tr.doc.toString()); // The modified document
    console.log(tr.steps.length); // → 2
    // view.state.apply(tr);
  }
</script>

<div bind:this={editor} id="editor"></div>
<div class="p-4">
  <Button variant="outline" class="mr-2" onclick={handleTransaction}>
    Transaction
  </Button>
  <Command
    suggestions={[]}
    open={command.open}
    filter={command.filter}
    placeholder="Type a label name"
  />

  <code id="info"></code>
</div>
