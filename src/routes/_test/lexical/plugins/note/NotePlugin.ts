import {
  $copyNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  TextNode,
} from "lexical";
import { $createNoteNode, $isNoteNode, NoteNode } from "./NoteNode";
import { mergeRegister } from "@lexical/utils";
import { nanoid } from "nanoid";

export const SEPARATOR = "---";

export function splitNote(
  anchorNode: LexicalNode,
): [ElementNode | null, ElementNode] {
  const recurse = <T extends LexicalNode>(
    currentNode: T,
  ): [ElementNode, ElementNode, T] => {
    const isNote = $isNoteNode(currentNode);
    if (isNote) {
      const newNote = $createNoteNode(nanoid(10));
      currentNode.insertAfter(newNote);
      return [currentNode, newNote, newNote as any];
    } else {
      const parent = currentNode.getParent()!;
      const [leftTree, rightTree, newParent] = recurse(parent);
      const nodeToMove =
        currentNode === anchorNode ? currentNode : $copyNode(currentNode);
      const nextSiblings = currentNode.getNextSiblings();
      // if moving all children to newParent, remove old parent (empty paragraph)
      if (parent.getChildrenSize() === nextSiblings.length + 1) {
        parent.remove();
      }
      newParent.append(nodeToMove, ...nextSiblings);
      return [leftTree, rightTree, nodeToMove];
    }
  };

  const [leftTree, rightTree] = recurse(anchorNode);
  return [leftTree, rightTree];
}

function findPreviousNonLineBreakSibling(node: LexicalNode) {
  // Get the previous sibling of the current node
  let previousSibling = node.getPreviousSibling();

  // If there is no previous sibling, move up to the parent node
  while (!previousSibling) {
    const parent = node.getParent();
    if (!parent) {
      // If there is no parent, we've reached the root and there are no previous siblings
      return null;
    }
    // Move to the parent node
    node = parent;
    // Get the previous sibling of the parent node
    previousSibling = node.getPreviousSibling();
  }

  return previousSibling;
}

function findNextSiblingAncestor(node: LexicalNode) {
  // Get the previous sibling of the current node
  let nextSibling = node.getNextSibling();

  // If there is no previous sibling, move up to the parent node
  while (!nextSibling) {
    const parent = node.getParent();
    if (!parent) {
      // If there is no parent, we've reached the root and there are no previous siblings
      return null;
    }
    // Move to the parent node
    node = parent;
    // Get the previous sibling of the parent node
    nextSibling = node.getNextSibling();
  }

  return nextSibling;
}

function splitNoteTransform(node: TextNode) {
  const selection = $getSelection();
  if (!selection || !$isRangeSelection(selection)) {
    return;
  }
  const anchorNode = selection.anchor.getNode();
  if (node !== selection.anchor.getNode()) {
    return;
  }
  const parent = anchorNode.getParent();
  if (!parent) {
    return;
  }
  const previousSibling = anchorNode.getPreviousSibling();
  const nextSibling = anchorNode.getNextSibling();

  // check that separator is on its own line
  const isLineStart =
    previousSibling === null || $isLineBreakNode(previousSibling);
  const isLineEnd = nextSibling === null || $isLineBreakNode(nextSibling);
  const textIsSeparator = anchorNode.getTextContent() === SEPARATOR;
  if (!(textIsSeparator && isLineStart && isLineEnd)) {
    console.log(
      "Separator is not on its own line",
      "textIsSeparator:",
      textIsSeparator,
      "isLineStart:",
      isLineStart,
      "isLineEnd:",
      isLineEnd,
    );
    return;
  }

  let splitAfter = findNextSiblingAncestor(nextSibling || parent);
  let splitBefore = findPreviousNonLineBreakSibling(previousSibling || parent);

  // if no siblings then remove paragraph and split after previous paragraph
  if (previousSibling === null && nextSibling === null) {
    parent.remove();
  } else {
    // remove previous siblings must line breaks and remove separator
    if (previousSibling) {
      previousSibling.remove();
    }
    if (nextSibling) {
      nextSibling.remove();
    }
    anchorNode.remove();
    console.log("parent text", parent.getTextContent());
    if (parent.getTextContent() === "") {
      parent.remove();
    }
  }
  if (!splitBefore) {
    // insert new note at start of document
    const newNote = $createNoteNode(nanoid(10));
    $getRoot().getFirstChild()?.insertBefore(newNote);
    newNote.select();
  } else if (!splitAfter) {
    // insert new note at end of document
    const newNote = $createNoteNode(nanoid(10));
    $getRoot().getLastChild()?.insertAfter(newNote);
    newNote.select();
  } else if ($isNoteNode(splitAfter)) {
    // if next sibling is a note, insert new note before it
    const newNote = $createNoteNode(nanoid(10));
    splitAfter.insertBefore(newNote);
    newNote.select();
  } else {
    splitNote(splitAfter);
  }
}

export function registerNote(editor: LexicalEditor): () => void {
  // We don't use editor.registerUpdateListener here as alternative approach where we rely
  // on update listener is highly discouraged as it triggers an additional render (the most expensive lifecycle operation).
  return mergeRegister(
    editor.registerMutationListener(
      NoteNode,
      (mutatedNodes, { prevEditorState }) => {
        // mutatedNodes is a Map where each key is the NodeKey, and the value is the state of mutation.
        for (let [nodeKey, mutation] of mutatedNodes) {
          // console.log(`Mutation for note ${nodeKey}: ${mutation}`);
          if (mutation === "destroyed") {
            // Get the node before it is fully removed
            const node = prevEditorState.read(() => $getNodeByKey(nodeKey));
            // console.log(`Destroyed node ${nodeKey}`, node);
            if (node instanceof NoteNode) {
              const noteId = node.id;
              // console.log(`Deleted Note ID: ${noteId}`);
            }
          }
        }
      },
    ),
    editor.registerNodeTransform(TextNode, splitNoteTransform),
  );
}
