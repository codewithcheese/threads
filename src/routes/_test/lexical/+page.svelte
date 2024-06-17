<script lang="ts">
  import "../../../app.css";

  import { createEmptyHistoryState, registerHistory } from "@lexical/history";
  import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
  import { mergeRegister } from "@lexical/utils";
  import {
    $getNodeByKey as getNodeByKey,
    createEditor,
    type LexicalEditor,
  } from "lexical";

  import _$prepopulatedNote from "./prepopulatedNote";
  // import prepopulatedRichText from "./prepopulatedRichText";
  import { mount, onMount } from "svelte";
  import { registerEmoji } from "./plugins/emoji/EmojiPlugin";
  import { EmojiNode } from "./plugins/emoji/EmojiNode";
  import { NoteNode } from "./plugins/note/NoteNode";
  import { registerNote } from "./plugins/note/NotePlugin";
  import { TagNodeSvelte } from "./plugins/tag/TagNode.svelte";
  import { type Mention } from "./plugins/mention/MentionPlugin";
  import TagMenu from "./plugins/TagMenu.svelte";

  const initialConfig = {
    namespace: "Vanilla JS Demo",
    // Register nodes specific for @lexical/rich-text
    nodes: [
      HeadingNode,
      QuoteNode,
      EmojiNode,
      NoteNode,
      TagNodeSvelte,
      // MentionNode,
    ],
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
  let editor: LexicalEditor;

  let mounted = new WeakMap<any, any>();

  const mentions: Mention[] = [
    {
      trigger: "@",
      name: "mention",
    },
    {
      trigger: "#",
      name: "tag",
    },
  ];

  onMount(() => {
    console.log("lexical page onMount");
    editor = createEditor(initialConfig);
    editor.setRootElement(editorRef!);

    mergeRegister(
      // registerMention(editor, mentions),
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
{#if editor}
  <TagMenu {editor} />
{/if}

<style lang="postcss">
  /*:global(.separator) {*/
  /*  @apply mt-1 pb-1;*/
  /*}*/
  :global(.note-node) {
    @apply mb-2 border-b border-gray-200 pb-2;
  }
  :global(.mention) {
    @apply rounded-sm bg-purple-500 px-1 py-0.5 text-purple-200;
  }
</style>
