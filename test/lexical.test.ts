/** @vitest-environment jsdom */
import { assert, describe, expect, it } from "vitest";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
} from "lexical";
import { createLexicalTest, LexicalTest } from "./util/lexical-test";

describe("Lexical Editor", () => {
  it(
    "should create a paragraph node",
    createLexicalTest(
      class extends LexicalTest {
        config() {
          return {
            nodes: [],
          };
        }
        register() {
          return () => {};
        }
        populate() {
          const rootNode = $getRoot();
          const paragraphNode = $createParagraphNode();
          paragraphNode.append($createTextNode("Hello, world!"));
          rootNode.append(paragraphNode);
        }
        expect() {
          const rootNode = $getRoot();
          expect(rootNode.getChildrenSize()).toBe(1);
          const firstNode = rootNode.getFirstChild();
          assert($isParagraphNode(firstNode));
          expect(firstNode.getChildrenSize()).toBe(1);
          const firstChild = firstNode.getFirstChild();
          assert($isTextNode(firstChild));
          expect(firstChild.getTextContent()).toBe("Hello, world!");
        }
      },
    ),
  );
});
