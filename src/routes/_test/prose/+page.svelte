<script lang="ts">
  import "prosemirror-view/style/prosemirror.css";
  import { EditorState, type Transaction } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { onMount } from "svelte";
  import { nanoid } from "nanoid";
  import AutocompleteMenu from "../../(app)/thread/[slug]/AutocompleteMenu.svelte";
  import {
    autocomplete,
    type AutocompleteAction,
    closeAutocomplete,
    type FromTo,
  } from "prosemirror-autocomplete";
  import { triggers } from "../../(app)/thread/[slug]/$autocomplete";
  import {
    Fragment,
    type Node,
    type NodeSpec,
    Schema,
    Slice,
  } from "prosemirror-model";
  import Tag from "./Tag.svelte";
  import { SvelteNodeView } from "./SvelteNodeView.svelte";
  import { InputRule, inputRules } from "prosemirror-inputrules";
  import { ChangeSet } from "prosemirror-changeset";
  import { splitBlockAs } from "$lib/prosemirror/commands";
  import Embed from "./Embed.svelte";

  /**
   * TODO
   * - paste note generate new id
   * - join notes when delete separator
   * - fixme: split same line as content
   */

  const noteSplitRule = new InputRule(/^---$/, (state, match, start, end) => {
    const { tr, doc } = state;

    let noteNode: Node | undefined = undefined;
    let notePos: number | null = null;

    // find note parent
    doc.nodesBetween(start, end, (node, pos) => {
      if (node.type === schema.nodes.note) {
        noteNode = node;
        notePos = pos;
        return false; // Stop traversing
      }
    });

    if (noteNode == null || notePos == null) {
      return null;
    }

    /**
     * Can split a note by inserting a closing token, the separator, and an open token.
     * See https://discuss.prosemirror.net/t/split-nodes-with-custom-schema-requirements/1355
     */

    // @ts-expect-error svelte incorrectly infers as never
    const beforeNode = schema.nodes.note.create(noteNode.attrs, [
      schema.nodes.paragraph.create({}, []),
    ]);
    // const separatorNode = schema.nodes.separator.create();
    const afterNode = schema.nodes.note.create({ id: nanoid(10) }, [
      schema.nodes.paragraph.create({}, []),
    ]);
    const preparedFragment = Fragment.from([
      beforeNode,
      // separatorNode,
      afterNode,
    ]);
    const preparedSlice = new Slice(preparedFragment, 2, 2);

    tr.replace(start - 2, end + 2, preparedSlice);

    return tr;
  });

  export const nodes = {
    doc: {
      content: "note*",
    } satisfies NodeSpec,

    note: {
      attrs: {
        id: {},
      },
      content: "block*",
      parseDOM: [
        {
          tag: "div.note",
          getAttrs: (dom) => ({
            id: dom.id,
          }),
        },
      ],
      toDOM(node) {
        return ["div", { class: "note", id: node.attrs.id }, 0];
      },
    } satisfies NodeSpec,

    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    } satisfies NodeSpec,

    // separator: {
    //   // group: "block",
    //   attrs: {
    //     class: { default: "separator" },
    //   },
    //   parseDOM: [{ tag: "hr.separator" }],
    //   toDOM() {
    //     return ["hr", { class: "separator" }];
    //   },
    // } satisfies NodeSpec,

    tag: {
      inline: true,
      group: "inline",
      // atom: true,
      selectable: true,
      // editable: false,
      attrs: {
        className: { default: "tag" },
        tagName: { default: "span" },
        value: { default: "" },
      },
      parseDOM: [
        {
          tag: "span.tag",
          getAttrs(dom) {
            return { value: dom.getAttribute("data-value") };
          },
        },
      ],
    } satisfies NodeSpec,

    embed: {
      inline: true,
      group: "inline",
      // atom: true,
      // editable: false,
      attrs: {
        className: { default: "embed" },
        tagName: { default: "div" },
        type: { default: "" },
      },
      parseDOM: [
        {
          tag: "span.embed",
          getAttrs(dom) {
            return { value: dom.getAttribute("data-type") };
          },
        },
      ],
    } satisfies NodeSpec,

    text: {
      group: "inline",
    } as NodeSpec,
  };

  export const marks = {};

  export const schema = new Schema({ nodes, marks });

  let doc = schema.node("doc", null, [
    schema.node("note", { id: nanoid(10) }, [
      schema.node("paragraph", null, [schema.text("One.")]),
      schema.node("paragraph", null, [schema.text("Two!")]),
    ]),
  ]);

  let editor: HTMLDivElement = $state(null)!;
  let editorState = EditorState.create({
    doc,
    schema,
    plugins: [
      inputRules({ rules: [noteSplitRule] }),
      ...autocomplete({
        triggers,
        reducer: (action) => {
          console.log("reducer", action);
          autocompleteAction = action;
          return true;
        },
      }),
      history(),
      keymap({
        "Mod-z": undo,
        "Mod-shift-z": redo,
        Enter: splitBlockAs(() => ({ type: schema.nodes.paragraph })),
      }),
      keymap(baseKeymap),
    ],
  });
  let view: EditorView = $state(null)!;
  let autocompleteAction: AutocompleteAction | null = $state(null);

  onMount(() => {
    view = new EditorView(editor, {
      state: editorState,
      nodeViews: {
        tag: (node, view1, getPos) =>
          new SvelteNodeView(Tag, node, view1, getPos),
        embed: (node, view1, getPos) =>
          new SvelteNodeView(Embed, node, view1, getPos),
      },
      dispatchTransaction(tr) {
        let changeSet = ChangeSet.create(view.state.doc);
        let newState = view.state.apply(tr);
        console.time("findTransactionDiff");
        const diff = findTransactionDiff(tr);
        console.timeEnd("findTransactionDiff");
        console.time("computeDiff");
        changeSet = changeSet.addSteps(newState.doc, tr.mapping.maps, {});
        console.timeEnd("computeDiff");
        console.log("changes", changeSet.changes);
        for (const change of changeSet.changes) {
          newState.doc.nodesBetween(change.toA, change.toB, (node, pos) => {
            if (node.type.name === "note") {
              console.log("node inserted", node.attrs.id, pos);
              console.log("node", node.toJSON());
            }
          });
        }

        if (diff) {
          try {
            tr.before.nodesBetween(diff.start, diff.endA, (node, pos) => {
              if (node.type.name === "note") {
                console.log("node before", node, pos);
              }
            });
            tr.doc.nodesBetween(diff.start, diff.endB, (node, pos) => {
              if (node.type.name === "note") {
                console.log("node after", node, pos);
              }
            });
          } catch (e) {
            console.error(e);
          }
        }
        // computeDiff(newState.doc, newState.doc, diff);
        view.updateState(newState);
      },
    });
  });

  function findTransactionDiff(tr: Transaction) {
    let beforeDoc = tr.before;
    let afterDoc = tr.doc;

    let start = beforeDoc.content.findDiffStart(afterDoc.content);
    if (start == null) return null;

    let end = beforeDoc.content.findDiffEnd(afterDoc.content);
    if (end == null) return null;

    let { a: endA, b: endB } = end;

    let before = beforeDoc.slice(start, endA);
    let after = afterDoc.slice(start, endB);

    return { start, endA, endB, before, after };
  }

  function handleAutocompleteSubmit(
    type: string,
    value: string,
    range: FromTo,
  ) {
    // console.log("Autocomplete Submit", type, value);
    const tr = view.state.tr;
    tr.delete(range.from, range.to);
    closeAutocomplete(view);
    if (type === "tag") {
      insertTag(tr, value, range.from);
    } else if (type === "command") {
      insertEmbed(tr, value, range.from);
    }
    view.dispatch(tr);
  }

  function insertTag(tr: Transaction, tag: string, from: number) {
    console.log("insertTag", tag, from);
    tr.insert(from, schema.node("tag", { value: tag }));
  }

  function insertEmbed(tr: Transaction, type: string, from: number) {
    console.log("insertEmbed", type, from);
    tr.insert(from, schema.node("embed", { type: type }));
  }
</script>

<div bind:this={editor} id="editor"></div>
<AutocompleteMenu
  onSubmit={handleAutocompleteSubmit}
  action={autocompleteAction}
/>

<style lang="postcss">
  /*:global(.separator) {*/
  /*  @apply mt-1 pb-1;*/
  /*}*/
  :global(.note) {
    @apply mb-2 border-b border-gray-200 pb-2;
  }
</style>
