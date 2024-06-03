<script lang="ts">
  import { EditorState, TextSelection } from "prosemirror-state";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import {
    baseKeymap,
    chainCommands,
    createParagraphNear,
    liftEmptyBlock,
    newlineInCode,
    splitBlockAs,
  } from "$lib/prosemirror/commands";
  import { EditorView } from "prosemirror-view";
  import { onMount } from "svelte";
  import { schema } from "$lib/prosemirror/schema";
  import {
    ActionKind,
    autocomplete,
    type AutocompleteAction,
    closeAutocomplete,
    type Options,
  } from "prosemirror-autocomplete";
  import AutocompleteMenu from "./AutocompleteMenu.svelte";
  import type { COMMANDS } from "./$data";

  type Props = {
    content: string;
    focused: boolean;
    resetOnSubmit?: boolean;
    onFocus: () => void;
    onSubmit: (value: string) => void;
    onLabelSubmit: (label: string) => void;
    onCommandSubmit: (commandId: keyof typeof COMMANDS) => void;
  };
  let {
    content,
    focused,
    resetOnSubmit = false,
    onFocus,
    onSubmit,
    onLabelSubmit,
    onCommandSubmit,
  }: Props = $props();

  let editor: HTMLDivElement = $state(null)!;
  let view: EditorView = $state(null)!;

  $effect(() => {
    if (view && focused) {
      view.focus();
      let lastPos = view.state.doc.content.size;
      const tr = view.state.tr.setSelection(
        TextSelection.create(view.state.doc, lastPos),
      );
      view.dispatch(tr);
    }
  });

  let autocompleteAction: AutocompleteAction | null = $state(null);

  export const autocompleteOptions: Options = {
    triggers: [
      { name: "hashtag", trigger: "#", cancelOnFirstSpace: true },
      { name: "command", trigger: "/", cancelOnFirstSpace: true },
    ],
    reducer: (action) => {
      console.log("reducer", action);
      autocompleteAction = action;
      return true;
    },
  };

  function handleAutocompleteSubmit(
    type: string,
    selected: { id: string; name: string },
  ) {
    closeAutocomplete(view);
    console.log("handleAutocompleteSubmit", type, selected);
    switch (type) {
      case "hashtag":
        onLabelSubmit(selected.name);
        break;
      case "command":
        onCommandSubmit(selected.id as keyof typeof COMMANDS);
        break;
      default:
        break;
    }
  }

  baseKeymap["Enter"] = chainCommands(
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    // always split a block to a paragraph
    splitBlockAs(() => ({ type: schema.nodes.paragraph })),
  );

  function handleSubmit(state: EditorState) {
    let newContent = "";
    state.doc.descendants((child) => {
      if (newContent && child.type === schema.nodes.paragraph) {
        newContent += "\n\n";
      }
      if (child.type === schema.nodes.text) {
        newContent += child.textContent;
      }
    });
    onSubmit(newContent);
    if (resetOnSubmit) {
      const state = createState();
      view.updateState(state);
    }
    return true;
  }

  function handleBlur() {
    autocompleteAction = null;
  }

  function createDoc() {
    return schema.node("doc", null, [
      schema.nodes.paragraph.create(null, content ? schema.text(content) : []),
    ]);
  }

  function createState() {
    return EditorState.create({
      doc: createDoc(),
      schema,
      plugins: [
        // labelDecorationPlugin,
        ...autocomplete(autocompleteOptions),
        keymap({ Enter: handleSubmit }),
        history(),
        keymap({ "Mod-z": undo, "Mod-shift-z": redo }),
        keymap(baseKeymap),
      ],
    });
  }

  onMount(() => {
    let editorState = createState();
    view = new EditorView(editor, {
      state: editorState,
      dispatchTransaction(transaction) {
        let oldState = view.state;
        let newState = oldState.apply(transaction);
        view.updateState(newState);
        // console.log("dispatchTransaction", transaction);
        // if (transaction.getMeta("pointer-events")) {
        //   onFocus();
        // }
      },
      handleDOMEvents: {
        focus: onFocus,
        blur: handleBlur,
      },
    });
    if (focused) {
      view.focus();
    }
  });

  // $inspect(suggestionState);
</script>

<div bind:this={editor}></div>
<AutocompleteMenu
  onSubmit={handleAutocompleteSubmit}
  action={autocompleteAction}
/>
