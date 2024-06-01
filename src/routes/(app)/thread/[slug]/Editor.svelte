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
    type Options,
  } from "prosemirror-autocomplete";
  import Suggestions from "./Suggestions.svelte";
  import { getAutocompleteInput } from "$lib/prosemirror/autocomplete.svelte";
  import { getMatchingLabels } from "./$data";

  type Props = {
    content: string;
    focused: boolean;
    resetOnSubmit?: boolean;
    onSubmit: (value: string) => void;
    onLabelSubmit: (label: string) => void;
    onCommandSubmit: (command: string) => void;
  };
  let {
    content,
    focused,
    resetOnSubmit = false,
    onSubmit,
    onLabelSubmit,
    onCommandSubmit,
  }: Props = $props();

  let editor: HTMLDivElement = $state(null)!;
  let view: EditorView = $state(null)!;

  $effect(() => {
    if (view && focused) {
      console.log("focus");
      view.focus();
      let lastPos = view.state.doc.content.size;
      const tr = view.state.tr.setSelection(
        TextSelection.create(view.state.doc, lastPos),
      );
      view.dispatch(tr);
    }
  });

  let suggestionState: {
    open: boolean;
    filter: string | undefined;
    suggestions: { name: string }[];
  } = $state({
    open: false,
    filter: undefined,
    suggestions: [],
  });

  export const autocompleteOptions: Options = {
    triggers: [
      { name: "hashtag", trigger: "#", cancelOnFirstSpace: true },
      { name: "slash", trigger: "/", cancelOnFirstSpace: true },
    ],
    reducer: autocompleteReducer,
  };

  function autocompleteReducer(action: AutocompleteAction): boolean {
    if (!action.type) {
      return true;
    }
    if (action.type.name === "hashtag") {
      return labelReducer(action);
    }
    if (action.type.name === "slash") {
      return commandReducer(action);
    }
    return true;
  }

  function labelReducer(action: AutocompleteAction): boolean {
    switch (action.kind) {
      case ActionKind.open:
        suggestionState.open = true;
        return true;
      case ActionKind.close:
        suggestionState.open = false;
        return true;
      case ActionKind.up:
        return true;
      case ActionKind.down:
        return true;
      case ActionKind.enter: {
        suggestionState.open = false;
        const input = getAutocompleteInput(view, action);
        if (!input) {
          return true;
        }
        onLabelSubmit(input.slice(1));
        // remove input
        view.dispatch(view.state.tr.delete(action.range.from, action.range.to));
        return true;
      }
      default:
        if (suggestionState.open && action.filter) {
          suggestLabels(action.filter);
        }
        return false;
    }
  }

  function commandSuggestions() {
    return [{ name: "YouTube" }];
  }

  function commandReducer(action: AutocompleteAction) {
    switch (action.kind) {
      case ActionKind.open:
        suggestionState.open = true;
        suggestionState.suggestions = commandSuggestions();
        return true;
      case ActionKind.close:
        suggestionState.open = false;
        return true;
      case ActionKind.up:
        return true;
      case ActionKind.down:
        return true;
      case ActionKind.enter: {
        suggestionState.open = false;
        const input = getAutocompleteInput(view, action);
        if (!input) {
          return true;
        }
        onCommandSubmit(input.slice(1));
        // remove input
        view.dispatch(view.state.tr.delete(action.range.from, action.range.to));
        return true;
      }
      default:
        return false;
    }
  }

  async function suggestLabels(label: string) {
    suggestionState.suggestions = await getMatchingLabels(label);
  }

  function moveSuggestions() {
    const suggestion = document.querySelector("#suggestions") as HTMLDivElement;
    const rect = document
      .querySelector(".autocomplete")
      ?.getBoundingClientRect();
    if (!rect) return;
    suggestion.style.top = `${rect.top + rect.height}px`;
    suggestion.style.left = `${rect.left}px`;
  }

  baseKeymap["Enter"] = chainCommands(
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    // always split a block to a paragraph
    splitBlockAs(() => ({ type: schema.nodes.paragraph })),
  );

  $effect(() => {
    if (!suggestionState.open) return;
    moveSuggestions();
  });

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
      },
    });
    if (focused) {
      view.focus();
    }
  });

  // $inspect(suggestionState);
</script>

<div bind:this={editor}></div>
<Suggestions open={suggestionState.open} filter={suggestionState.filter} />
