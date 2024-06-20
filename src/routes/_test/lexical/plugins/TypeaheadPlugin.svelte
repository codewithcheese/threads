<script lang="ts">
  import {
    $getSelection as getSelection,
    $isRangeSelection as isRangeSelection,
    $isTextNode as isTextNode,
    type LexicalEditor,
  } from "lexical";
  import { mergeRegister } from "@lexical/utils";
  import { onMount } from "svelte";
  import type { MenuResolution, TriggerFn } from "./Typeahead";
  import { getTextUpToAnchor } from "../utils/anchor";

  type Props = {
    editor: LexicalEditor;
    triggerFn: TriggerFn;
    onOpen: (res: MenuResolution) => void;
    onClose: () => void;
    onQueryChange: (matchingString: string | null) => void;
  };
  let { editor, triggerFn, onQueryChange, onOpen, onClose }: Props = $props();

  function closeTypeahead() {
    onClose();
  }

  function openTypeahead(res: MenuResolution) {
    onOpen(res);
  }

  function tryToPositionRange(
    leadOffset: number,
    range: Range,
    editorWindow: Window,
  ): boolean {
    const domSelection = editorWindow.getSelection();
    if (domSelection === null || !domSelection.isCollapsed) {
      return false;
    }
    const anchorNode = domSelection.anchorNode;
    const startOffset = leadOffset;
    const endOffset = domSelection.anchorOffset;

    if (anchorNode == null || endOffset == null) {
      return false;
    }

    try {
      range.setStart(anchorNode, startOffset);
      range.setEnd(anchorNode, endOffset);
    } catch (error) {
      return false;
    }

    return true;
  }

  function getQueryTextForSearch(editor: LexicalEditor): string | null {
    let text = null;
    editor.getEditorState().read(() => {
      const selection = getSelection();
      if (!isRangeSelection(selection)) {
        return;
      }
      text = getTextUpToAnchor(selection);
    });
    return text;
  }

  function isSelectionOnEntityBoundary(
    editor: LexicalEditor,
    offset: number,
  ): boolean {
    if (offset !== 0) {
      return false;
    }
    return editor.getEditorState().read(() => {
      const selection = getSelection();
      if (isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const prevSibling = anchorNode.getPreviousSibling();
        return isTextNode(prevSibling) && prevSibling.isTextEntity();
      }
      return false;
    });
  }

  onMount(() => {
    console.log("typeahead plugin onMount", editor);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editor.getEditorState().read(() => {
          const editorWindow = editor._window || window;
          const range = editorWindow.document.createRange();
          const selection = getSelection();
          const text = getQueryTextForSearch(editor);

          if (
            !isRangeSelection(selection) ||
            !selection.isCollapsed() ||
            text === null ||
            range === null
          ) {
            closeTypeahead();
            return;
          }

          const match = triggerFn(text, editor);
          onQueryChange(match ? match.matchingString : null);

          if (
            match !== null &&
            !isSelectionOnEntityBoundary(editor, match.leadOffset)
          ) {
            const isRangePositioned = tryToPositionRange(
              match.leadOffset,
              range,
              editorWindow,
            );
            if (isRangePositioned !== null) {
              openTypeahead({
                getRect: () => range.getBoundingClientRect(),
                match,
              });
              return;
            }
          }
          closeTypeahead();
        });
      }),
    );
  });
</script>
