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
          key: "Ctrl-Enter",
          run: () => {
            onSubmit(content);
            return true;
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
