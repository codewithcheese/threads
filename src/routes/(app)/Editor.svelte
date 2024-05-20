<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import { languages } from "@codemirror/language-data";
  import { EditorView, keymap } from "@codemirror/view";
  import { Prec } from "@codemirror/state";

  let {
    content = $bindable(""),
    onSubmit,
  }: { content: string; onSubmit: (value: string) => void } = $props();

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
  ];
</script>

<CodeMirror class="w-full" bind:value={content} {extensions} />
