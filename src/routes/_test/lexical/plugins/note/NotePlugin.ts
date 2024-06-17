import { $getNodeByKey, type LexicalEditor, TextNode } from "lexical";
import { NoteNode } from "./NoteNode";
import { mergeRegister } from "@lexical/utils";

function noteSplitTransform(node: NoteNode) {
  // console.log("noteSplitTransform", node);
  // const textContent = node.getTextContent();
  // const splitText = "---";
  //
  // if (textContent.includes(splitText)) {
  //   const parts = textContent.split(splitText);
  //   const parent = node.getParentOrThrow();
  //   const newNoteNode = $createNoteNode(node.__id);
  //
  //   // Clear the current node and add the first part
  //   node.clear();
  //   node.append($createTextNode(parts[0]));
  //
  //   // Add the new note node with the second part
  //   newNoteNode.append($createTextNode(parts[1]));
  //   parent.insertAfter(newNoteNode);
  //
  //   // Set the selection to the start of the new note node
  //   const selection = $getSelection();
  //   if (selection !== null) {
  //     newNoteNode.selectStart();
  //   }
  // }
}

function textSeparatorTransform(node: TextNode) {
  // console.log("textSeparatorTransform", node);
}

export function registerNote(editor: LexicalEditor): () => void {
  // We don't use editor.registerUpdateListener here as alternative approach where we rely
  // on update listener is highly discouraged as it triggers an additional render (the most expensive lifecycle operation).
  return mergeRegister(
    editor.registerNodeTransform(NoteNode, noteSplitTransform),
    editor.registerNodeTransform(TextNode, textSeparatorTransform),
    editor.registerMutationListener(
      NoteNode,
      (mutatedNodes, { prevEditorState }) => {
        // mutatedNodes is a Map where each key is the NodeKey, and the value is the state of mutation.
        for (let [nodeKey, mutation] of mutatedNodes) {
          console.log(`Mutation for note ${nodeKey}: ${mutation}`);
          if (mutation === "destroyed") {
            // Get the node before it is fully removed
            const node = prevEditorState.read(() => $getNodeByKey(nodeKey));
            console.log(`Destroyed node ${nodeKey}`, node);
            if (node instanceof NoteNode) {
              const noteId = node.id;
              console.log(`Deleted Note ID: ${noteId}`);
            }
          }
        }
      },
    ),
    editor.registerUpdateListener(
      ({ prevEditorState, dirtyElements, dirtyLeaves }) => {
        console.log("updateListener", dirtyElements, dirtyLeaves);
      },
    ),
  );
}
