/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import { $createNoteNode } from "./plugins/note/NoteNode";
import { nanoid } from "nanoid";
import { $createTagNode } from "./plugins/tag/TagNode.svelte";

export default function $prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() !== null) {
    return;
  }

  const note = $createNoteNode(nanoid(10));
  root.append(note);
  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode("This is the first line"));
  paragraph.append($createLineBreakNode());
  paragraph.append($createTextNode("This is the second line"));
  paragraph.append($createLineBreakNode());
  paragraph.append($createTextNode("This is the third line"));
  note.append(paragraph);
  const tag = $createTagNode("tag");
  paragraph.append(tag);

  {
    const note = $createNoteNode(nanoid(10));
    root.append(note);
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode("Hello, world! This is a note."));
    note.append(paragraph);
  }
}
