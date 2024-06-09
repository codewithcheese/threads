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
    autocomplete,
    type AutocompleteAction,
    closeAutocomplete,
    type Options,
  } from "prosemirror-autocomplete";
  import AutocompleteMenu from "./AutocompleteMenu.svelte";
  import type { COMMANDS } from "./$data";
  import { placeholder } from "$lib/prosemirror/placeholder";
  import {
    findDocumentPos,
    findFirstTextRange,
    findLastTextPos,
    findLastTextRange,
  } from "$lib/prosemirror/pos";

  type Props = {
    content: string;
    focusLeft?: number;
    focusDirection?: "top" | "bottom";
    focused?: boolean;
    resetOnSubmit?: boolean;
    onFocus?: () => void;
    onChange?: (value: string) => void;
    onSubmit: (value: string) => boolean | void | Promise<void>;
    onLabelSubmit: (label: string) => void;
    onCommandSubmit: (commandId: keyof typeof COMMANDS) => void;
    onFocusNext?: (left: number) => void;
    onFocusPrevious?: (left: number) => void;
  };
  let {
    content,
    focusLeft,
    focusDirection,
    focused = true,
    resetOnSubmit = false,
    onFocus,
    onChange,
    onSubmit,
    onLabelSubmit,
    onCommandSubmit,
    onFocusPrevious = () => {},
    onFocusNext = () => {},
  }: Props = $props();

  let editor: HTMLDivElement = $state(null)!;
  let view: EditorView = $state(null)!;

  $effect(() => {
    // on focused
    if (view && focused) {
      view.focus();
      // console.log("focus left", focusLeft, "focus direction", focusDirection);
      let tr = view.state.tr;
      if (focusLeft != null && focusDirection != null) {
        let pos = findDocumentPos(view, focusLeft, focusDirection);
        // console.log("findDocumentPos", pos);
        tr.setSelection(
          TextSelection.create(
            view.state.doc,
            pos ?? findLastTextPos(view.state) ?? 0,
          ),
        );
      } else {
        tr.setSelection(
          TextSelection.create(
            view.state.doc,
            findLastTextPos(view.state) ?? 0,
          ),
        );
      }
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

  function handleKeyDown(view: EditorView, event: KeyboardEvent) {
    const { state } = view;
    const { selection } = state;

    if (
      event.key === "ArrowUp" &&
      selection.empty &&
      view.endOfTextblock("up")
    ) {
      const range = findFirstTextRange(state);
      // if cursor in range
      if (range && selection.from >= range.from && selection.from <= range.to) {
        const { left } = view.coordsAtPos(view.state.selection.from);
        // console.log("onFocusPrevious", left);
        onFocusPrevious(left);
        return true;
      }
    }

    if (
      event.key === "ArrowDown" &&
      selection.empty &&
      view.endOfTextblock("down")
    ) {
      const range = findLastTextRange(state);
      if (range && selection.from >= range.from && selection.from <= range.to) {
        const { left } = view.coordsAtPos(view.state.selection.from);
        // console.log("onFocusNext", left);
        onFocusNext(left);
        return true;
      }
    }

    return false;
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
    // const mentions = getMentions(state.doc);
    let submitResult = onSubmit(newContent);
    if (submitResult !== false && resetOnSubmit) {
      const state = createState();
      view.updateState(state);
    }
    return true;
  }

  function handleBlur() {
    autocompleteAction = null;
  }

  function fromContent(content: string | undefined) {
    let paragraphs;
    if (content) {
      paragraphs = content
        .split("\n\n")
        .map((text) =>
          schema.nodes.paragraph.create({}, text ? schema.text(text) : []),
        );
    } else {
      paragraphs = [schema.nodes.paragraph.create({}, [])];
    }
    return schema.node("doc", null, paragraphs);
  }

  function toContent(state: EditorState) {
    let newContent = "";
    state.doc.descendants((child) => {
      if (newContent && child.type === schema.nodes.paragraph) {
        newContent += "\n\n";
      }
      if (child.type === schema.nodes.text) {
        newContent += child.textContent;
      }
    });
    return newContent;
  }

  function createState() {
    return EditorState.create({
      doc: fromContent(content),
      schema,
      plugins: [
        // labelDecorationPlugin,
        ...autocomplete(autocompleteOptions),
        keymap({
          "Shift-Enter": splitBlockAs(() => ({ type: schema.nodes.paragraph })),
          "Mod-Enter": handleSubmit,
        }),
        history(),
        keymap({ "Mod-z": undo, "Mod-shift-z": redo }),
        keymap(baseKeymap),
        placeholder("Write something, or press '/' for commands."),
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
        if (transaction.docChanged && onChange) {
          onChange(toContent(newState));
        }
        // console.log("dispatchTransaction", transaction);
        // if (transaction.getMeta("pointer-events")) {
        //   onFocus();
        // }
      },
      handleDOMEvents: {
        focus: onFocus,
        blur: handleBlur,
      },
      handleKeyDown,
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

<style lang="postcss">
  :global(.ProseMirror[data-placeholder]::before) {
    @apply pointer-events-none absolute text-gray-500;
    content: attr(data-placeholder);
  }
</style>
