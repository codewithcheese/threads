<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import { languages } from "@codemirror/language-data";
  import {
    crosshairCursor,
    drawSelection,
    dropCursor,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
  } from "@codemirror/view";
  import { EditorState, type Extension, Prec } from "@codemirror/state";
  import {
    bracketMatching,
    defaultHighlightStyle,
    foldGutter,
    foldKeymap,
    indentOnInput,
    syntaxHighlighting,
  } from "@codemirror/language";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
  import {
    autocompletion,
    closeBrackets,
    closeBracketsKeymap,
    completionKeymap,
  } from "@codemirror/autocomplete";
  import { lintKeymap } from "@codemirror/lint";

  let {
    content = $bindable(""),
    placeholder = "What's on your mind?",
    resetOnSubmit = false,
    onSubmit,
  }: {
    content: string;
    placeholder?: string;
    resetOnSubmit?: boolean;
    onSubmit: (value: string) => void;
  } = $props();

  export const basicSetup: Extension = (() => [
    // lineNumbers(),
    // highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    // foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    // highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
  ])();

  const extensions = [
    Prec.highest(
      keymap.of([
        {
          key: "Enter",
          run: (view) => {
            // use view state to get the current content, since cannot rely on
            // the content binding to be updated before enter is pressed
            const value = view.state.doc.toString();
            if (value.length === 0) {
              return false;
            }
            onSubmit(value);
            if (resetOnSubmit) {
              view.dispatch({
                changes: {
                  from: 0,
                  to: view.state.doc.length,
                  insert: "",
                },
              });
            }
            return true;
          },
        },
        {
          key: "Shift-Enter",
          run: () => {
            return false;
          },
        },
      ]),
    ),
    EditorView.lineWrapping,
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
    basicSetup,
  ];
</script>

<CodeMirror
  {placeholder}
  basic={false}
  class="w-full"
  bind:value={content}
  {extensions}
/>

<style lang="postcss">
  :global(.cm-line) {
    padding: 0 2px 0 2px !important;
  }
</style>
