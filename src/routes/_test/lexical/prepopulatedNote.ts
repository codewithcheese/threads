/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { $createNoteNode } from "./plugins/note/NoteNode";
import { nanoid } from "nanoid";
import { $createTagNode } from "./plugins/tag/TagNode";

export default function $prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() !== null) {
    return;
  }

  const note = $createNoteNode(nanoid(10));
  root.append(note);
  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode("Hello, world! This is a note."));
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