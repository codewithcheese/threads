<script lang="ts">
  import "../../../app.css";

  import { createEmptyHistoryState, registerHistory } from "@lexical/history";
  import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
  import { mergeRegister } from "@lexical/utils";
  import { createEditor, $getNodeByKey as getNodeByKey } from "lexical";

  import _$prepopulatedNote from "./prepopulatedNote";
  // import prepopulatedRichText from "./prepopulatedRichText";
  import { mount, onMount } from "svelte";
  import { registerEmoji } from "./plugins/emoji/EmojiPlugin";
  import { EmojiNode } from "./plugins/emoji/EmojiNode";
  import { NoteNode } from "./plugins/note/NoteNode";
  import { registerNote } from "./plugins/note/NotePlugin";
  import { TagNodeSvelte } from "./plugins/tag/TagNode.svelte";

  const initialConfig = {
    namespace: "Vanilla JS Demo",
    // Register nodes specific for @lexical/rich-text
    nodes: [HeadingNode, QuoteNode, EmojiNode, NoteNode, TagNodeSvelte],
    onError: (error: Error) => {
      throw error;
    },
    theme: {
      // Adding styling to Quote node, see styles.css
      quote: "PlaygroundEditorTheme__quote",
    },
  };

  let editorRef: HTMLDivElement;
  let stateRef: HTMLTextAreaElement;

  let mounted = new WeakMap<any, any>();

  onMount(() => {
    const editor = createEditor(initialConfig);
    editor.setRootElement(editorRef!);

    mergeRegister(
      registerNote(editor),
      registerEmoji(editor),
      registerRichText(editor),
      registerHistory(editor, createEmptyHistoryState(), 300),
      editor.registerDecoratorListener<{
        component: any;
        props: object;
      }>((decorators) => {
        for (const [key, decorator] of Object.entries(decorators)) {
          const { component, props } = decorator;

          const node = editor.getEditorState().read(() => {
            return getNodeByKey(key);
          });
          if (!node) {
            console.log("decoarator node not found", key);
            continue;
          }

          const element = editor.getElementByKey(key);
          if (!element) {
            console.log("element not found", key);
            continue;
          }

          if (!element.firstChild) {
            console.log("mounting", key);
            mount(component, { target: element, props });
          }
        }
      }),
    );

    editor.update(_$prepopulatedNote, { tag: "history-merge" });

    editor.registerUpdateListener(({ editorState }) => {
      stateRef!.value = JSON.stringify(editorState.toJSON(), undefined, 2);
    });
  });
</script>

<div bind:this={editorRef} contenteditable="true"></div>
<textarea bind:this={stateRef}></textarea>

<style lang="postcss">
  /*:global(.separator) {*/
  /*  @apply mt-1 pb-1;*/
  /*}*/
  :global(.note-node) {
    @apply mb-2 border-b border-gray-200 pb-2;
  }
</style>
