import { assert, describe, expect, it, test } from "vitest";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import {
  registerNote,
  SEPARATOR,
} from "../src/routes/_test/lexical/plugins/note/NotePlugin";
import {
  $createNoteNode,
  NoteNode,
} from "../src/routes/_test/lexical/plugins/note/NoteNode";
import { createLexicalTest, LexicalTest } from "./util/lexical-test";

describe("Split note at separator", () => {
  //Rule: Separator must be on its own line
  it(
    "Should not split when text node containing separator has content size greater than separator size",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [NoteNode],
          };
        }
        register() {
          return registerNote(this.editor);
        }
        populate() {
          const rootNode = $getRoot();
          const noteNode = $createNoteNode("test");
          const p1 = $createParagraphNode().append(
            $createTextNode("Hello, world!"),
          );
          // double separator for content size greater than separator size
          const separatorNode = $createTextNode(SEPARATOR + SEPARATOR);
          const p2 = $createParagraphNode().append(separatorNode);
          const p3 = $createParagraphNode().append(
            $createTextNode("Goodbye, world!"),
          );
          noteNode.append(p1, p2, p3);
          // set cursor at separator
          separatorNode.select();
          rootNode.append(noteNode);
        }
        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(1);
          const firstNode = rootNode.getFirstChild();
          assert(firstNode instanceof NoteNode);
          expect(firstNode.getChildrenSize()).toBe(3);
        }
      },
    ),
  );
  it(
    "Should not split when TextNode previous sibling is content node",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [NoteNode],
          };
        }
        register() {
          return registerNote(this.editor);
        }
        populate() {
          const rootNode = $getRoot();
          const noteNode = $createNoteNode("test");
          // first paragraph containing two text nodes, second is separator
          const firstParagraph = $createParagraphNode();
          const previousSibling = $createTextNode("Hello, world!");
          const separatorNode = $createTextNode(SEPARATOR);
          firstParagraph.append(
            previousSibling,
            separatorNode,
            $createLineBreakNode(),
          );
          const secondParagraph = $createParagraphNode().append(
            $createTextNode("Goodbye, world!"),
          );
          noteNode.append(firstParagraph, secondParagraph);
          // set cursor at separator
          separatorNode.select();
          rootNode.append(noteNode);
        }
        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(1);
          const firstNode = rootNode.getFirstChild();
          assert(firstNode instanceof NoteNode);
          expect(firstNode.getChildrenSize()).toBe(2);
        }
      },
    ),
  );
  it(
    "Should not split when separator TextNode next sibling is content node",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [NoteNode],
          };
        }
        register() {
          return registerNote(this.editor);
        }
        populate() {
          const rootNode = $getRoot();
          const noteNode = $createNoteNode("test");
          const firstParagraph = $createParagraphNode().append(
            $createTextNode("Hello, world!"),
          );
          const separatorNode = $createTextNode(SEPARATOR);
          const secondParagraph = $createParagraphNode().append(
            $createLineBreakNode(),
            separatorNode,
            $createTextNode("Goodbye, world!"),
          );
          noteNode.append(firstParagraph, secondParagraph);
          // set cursor at separator
          separatorNode.select();
          rootNode.append(noteNode);
        }
        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(1);
          const firstNode = rootNode.getFirstChild();
          assert(firstNode instanceof NoteNode);
          expect(firstNode.getChildrenSize()).toBe(2);
        }
      },
    ),
  );
  describe("Should split when text has either no siblings or line break siblings", () => {
    test(
      "when separator text node has no siblings",
      createLexicalTest(
        class extends LexicalTest {
          config() {
            return {
              nodes: [NoteNode],
            };
          }

          register() {
            return registerNote(this.editor);
          }

          populate() {
            const rootNode = $getRoot();
            const noteNode = $createNoteNode("test");
            const firstParagraph = $createParagraphNode().append(
              $createTextNode("Hello, world!"),
            );
            const separatorNode = $createTextNode(SEPARATOR);
            const secondParagraph =
              $createParagraphNode().append(separatorNode);
            const thirdParagraph = $createParagraphNode().append(
              $createTextNode("Goodbye, world!"),
            );
            noteNode.append(firstParagraph, secondParagraph, thirdParagraph);
            // set cursor at separator
            separatorNode.select();
            rootNode.append(noteNode);
          }

          expect() {
            const rootNode = $getRoot();
            console.log(rootNode.getTextContent());
            expect(rootNode.getChildrenSize()).toBe(2);
            const firstNote = rootNode.getFirstChild();
            assert(firstNote instanceof NoteNode);
            expect(firstNote.id).toBe("test");
            expect(firstNote.getTextContent()).toEqual("Hello, world!");
            expect(firstNote.getChildrenSize()).toBe(1);
            const secondNote = firstNote.getNextSibling();
            assert(secondNote instanceof NoteNode);
            expect(secondNote.getTextContent()).toEqual("Goodbye, world!");
            expect(secondNote.getChildrenSize()).toBe(1);
          }
        },
      ),
    );
    it(
      "when separator text node has no previous sibling and line break next sibling",
      createLexicalTest(
        class extends LexicalTest {
          config() {
            return {
              nodes: [NoteNode],
            };
          }

          register() {
            return registerNote(this.editor);
          }

          populate() {
            const rootNode = $getRoot();
            const noteNode = $createNoteNode("test");
            const firstParagraph = $createParagraphNode().append(
              $createTextNode("Hello, world!"),
            );
            const separatorNode = $createTextNode(SEPARATOR);
            const separatorParagraph = $createParagraphNode().append(
              separatorNode,
              $createLineBreakNode(),
            );
            noteNode.append(firstParagraph, separatorParagraph);
            // set cursor at separator
            separatorNode.select();
            rootNode.append(noteNode);
          }

          expect() {
            const rootNode = $getRoot();
            expect(rootNode.getChildrenSize()).toBe(2);
            const firstNote = rootNode.getFirstChild();
            assert(firstNote instanceof NoteNode);
            expect(firstNote.id).toBe("test");
            expect(firstNote.getChildrenSize()).toBe(1);
            expect(firstNote.getTextContent()).toEqual("Hello, world!");
            const secondNote = firstNote.getNextSibling();
            assert(secondNote instanceof NoteNode);
            expect(secondNote.getChildrenSize()).toBe(0);
          }
        },
      ),
    );
    it(
      "when separator text node has line break previous sibling and and no next sibling",
      createLexicalTest(
        class extends LexicalTest {
          config() {
            return {
              nodes: [NoteNode],
            };
          }

          register() {
            return registerNote(this.editor);
          }

          populate() {
            const rootNode = $getRoot();
            const noteNode = $createNoteNode("test");
            const separatorNode = $createTextNode(SEPARATOR);
            const firstParagraph = $createParagraphNode().append(
              $createTextNode("Hello, world!"),
            );
            const separatorParagraph = $createParagraphNode().append(
              $createLineBreakNode(),
              separatorNode,
            );
            noteNode.append(firstParagraph, separatorParagraph);
            // set cursor at separator
            separatorNode.select();
            rootNode.append(noteNode);
          }

          expect() {
            const rootNode = $getRoot();
            expect(rootNode.getChildrenSize()).toBe(2);
            const firstNote = rootNode.getFirstChild();
            assert(firstNote instanceof NoteNode);
            expect(firstNote.id).toBe("test");
            expect(firstNote.getChildrenSize()).toBe(1);
            const secondNote = firstNote.getNextSibling();
            assert(secondNote instanceof NoteNode);
            expect(secondNote.getChildrenSize()).toBe(0);
          }
        },
      ),
    );
    it(
      "when separator text node has line break next and previous sibling",
      createLexicalTest(
        class extends LexicalTest {
          config() {
            return {
              nodes: [NoteNode],
            };
          }

          register() {
            return registerNote(this.editor);
          }

          populate() {
            const rootNode = $getRoot();
            const noteNode = $createNoteNode("test");
            const firstParagraph = $createParagraphNode().append(
              $createTextNode("Hello, world!"),
            );
            const separatorNode = $createTextNode(SEPARATOR);
            const separatorParagraph = $createParagraphNode().append(
              $createLineBreakNode(),
              separatorNode,
              $createLineBreakNode(),
            );
            noteNode.append(firstParagraph, separatorParagraph);
            // set cursor at separator
            separatorNode.select();
            rootNode.append(noteNode);
          }

          expect() {
            const rootNode = $getRoot();
            expect(rootNode.getChildrenSize()).toBe(2);
            const firstNote = rootNode.getFirstChild();
            assert(firstNote instanceof NoteNode);
            expect(firstNote.getChildrenSize()).toBe(1);
            expect(firstNote.getTextContent()).toEqual("Hello, world!");
            expect(firstNote.id).toBe("test");
            const secondNote = firstNote.getNextSibling();
            assert(secondNote instanceof NoteNode);
            expect(secondNote.getChildrenSize()).toBe(0);
          }
        },
      ),
    );
  });
  // todo: should split a multi-child paragraph
  /*
    Split logic moves nodes below separator but when separator is at the
    start of the document, then it makes more sense to leave the nodes in
    their note and create a new empty note before.
  */
  it(
    "should create empty note at start of document if no previous siblings for all ancestors",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [NoteNode],
          };
        }

        register() {
          return registerNote(this.editor);
        }

        populate() {
          const rootNode = $getRoot();
          const noteNode = $createNoteNode("test");
          const separatorNode = $createTextNode(SEPARATOR);
          const separatorParagraph =
            $createParagraphNode().append(separatorNode);
          const finalParagraph = $createParagraphNode().append(
            $createTextNode("Goodbye, world!"),
          );
          noteNode.append(separatorParagraph, finalParagraph);
          // set cursor at separator
          separatorNode.select();
          rootNode.append(noteNode);
        }

        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(2);
          const firstNote = rootNode.getFirstChild();
          assert(firstNote instanceof NoteNode);
          expect(firstNote.getChildrenSize()).toBe(0);
          const secondNote = firstNote.getNextSibling();
          assert(secondNote instanceof NoteNode);
          expect(secondNote.getChildrenSize()).toBe(1);
          expect(secondNote.getTextContent()).toEqual("Goodbye, world!");
          expect(secondNote.id).toBe("test");
        }
      },
    ),
  );
  it(
    "should create empty note at end of document if no next siblings for all ancestors",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [NoteNode],
          };
        }

        register() {
          return registerNote(this.editor);
        }

        populate() {
          const rootNode = $getRoot();
          const noteNode = $createNoteNode("test");
          const firstParagraph = $createParagraphNode().append(
            $createTextNode("Hello, world!"),
          );
          const separatorNode = $createTextNode(SEPARATOR);
          const separatorParagraph =
            $createParagraphNode().append(separatorNode);
          noteNode.append(firstParagraph, separatorParagraph);
          // set cursor at separator
          separatorNode.select();
          rootNode.append(noteNode);
        }

        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(2);
          const firstNote = rootNode.getFirstChild();
          assert(firstNote instanceof NoteNode);
          expect(firstNote.getChildrenSize()).toBe(1);
          expect(firstNote.getTextContent()).toEqual("Hello, world!");
          expect(firstNote.id).toBe("test");
          const secondNote = firstNote.getNextSibling();
          assert(secondNote instanceof NoteNode);
          expect(secondNote.getChildrenSize()).toBe(0);
        }
      },
    ),
  );
});
