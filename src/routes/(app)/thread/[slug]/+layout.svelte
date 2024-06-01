<script lang="ts">
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { createChat, deleteNote, submitNote, updateNote } from "./$data.js";
  import { MessageCircleIcon } from "lucide-svelte";
  import { page } from "$app/stores";
  import { useDb } from "$database";
  import { desc } from "drizzle-orm";
  import { chatTable, type Note } from "$database/schema";
  import { Button } from "$components/ui/button";
  import { Card, CardContent } from "$components/ui/card";
  import { EditorState, Transaction } from "prosemirror-state";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import {
    baseKeymap,
    chainCommands,
    createParagraphNear,
    liftEmptyBlock,
    newlineInCode,
    splitBlockAs,
  } from "$lib/prosemirror/commands";
  import { EditorView } from "prosemirror-view";
  import { onMount } from "svelte";
  import { schema } from "$lib/prosemirror/schema";
  import { nanoid } from "nanoid";
  import { ReplaceStep } from "prosemirror-transform";
  import { type Node } from "prosemirror-model";
  import { autocomplete } from "prosemirror-autocomplete";
  import Suggestions from "./Suggestions.svelte";
  import {
    ActionKind,
    type AutocompleteAction,
    type Options,
  } from "prosemirror-autocomplete";
  import {
    createLabelFromRange,
    labelDecorationPlugin,
    parseNote,
    toContent,
  } from "$lib/prosemirror/note";

  let { data } = $props();

  let editor: HTMLDivElement = $state(null)!;
  let view: EditorView = $state(null)!;
  let content = $state("");

  let doc = schema.node("doc", null, []);

  let suggestionState: {
    open: boolean;
    filter: string | undefined;
    suggestions: { name: string }[];
  } = $state({
    open: false,
    filter: undefined,
    suggestions: [],
  });

  export const autocompleteOptions: Options = {
    triggers: [
      { name: "hashtag", trigger: "#", cancelOnFirstSpace: true },
      { name: "mention", trigger: "@" },
    ],
    reducer: autocompleteReducer,
  };

  function autocompleteReducer(action: AutocompleteAction) {
    console.log("autocompleteReducer", action);
    suggestionState.filter = action.filter;
    switch (action.kind) {
      case ActionKind.open:
        suggestionState.open = true;
        return true;
      case ActionKind.close:
        console.log("closing suggestions");
        suggestionState.open = false;
        return true;
      case ActionKind.up:
        return true;
      case ActionKind.down:
        return true;
      case ActionKind.enter: {
        suggestionState.open = false;
        // create label
        createLabelFromRange(view, action.range.from, action.range.to);
        return true;
      }
      default:
        return false;
    }
  }

  function moveSuggestions() {
    const suggestion = document.querySelector("#suggestions") as HTMLDivElement;
    const rect = document
      .querySelector(".autocomplete")
      ?.getBoundingClientRect();
    if (!rect) return;
    suggestion.style.top = `${rect.top + rect.height}px`;
    suggestion.style.left = `${rect.left}px`;
  }

  // function createLabel(from: number, to: number) {
  //   const { doc, tr } = view.state;
  //   const { schema } = doc.type;
  //
  //   if (from === to) {
  //     return false; // No selection, so do nothing
  //   }
  //
  //   const selection = TextSelection.create(doc, from, to);
  //
  //   if (!selection.content().size) {
  //     return false; // No content in the selection, so do nothing
  //   }
  //   const text = selection.content().content;
  //
  //   const label = schema.nodes.label.create({}, schema.text());
  //   const slice = new Slice(Fragment.from(label), 0, 0);
  //
  //   tr.replace(from, to, slice);
  //
  //   view.dispatch(tr);
  // }

  baseKeymap["Enter"] = chainCommands(
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    // always split a block to a paragraph
    splitBlockAs(() => ({ type: schema.nodes.paragraph })),
  );

  function update() {
    const oldNotes = new Set();
    view.state.doc.descendants((node, pos, parent) => {
      if (node.type === schema.nodes.note) {
        oldNotes.add(node.attrs.id);
      }
    });
    console.log("oldNotes", oldNotes);

    // let newNotes = new Set(data.notes.map((note) => note.id));
    // let notesToRemove = notes.filter((note) => !newNotes.has(note.id));
    let notesToAdd = data.notes.filter((note) => !oldNotes.has(note.id));
    console.log("notesToAdd", notesToAdd);
    insertNotes(notesToAdd);
  }

  function insertNotes(notesToAdd: Note[]) {
    const { schema, tr } = view.state;

    const nodes = notesToAdd.map((note) => {
      return parseNote(note);
    });

    if (nodes.length > 0) {
      tr.setMeta("external", true);
      tr.insert(tr.doc.content.size, nodes);
      view.dispatch(tr);
    }
  }

  type ChangeRange = {
    from: number;
    to: number;
  };

  function getAffectedNotes(
    transaction: Transaction,
    oldState: EditorState,
    newState: EditorState,
  ) {
    const changes = new Map<Node, "create" | "delete" | "update">();
    const oldChangeRanges: ChangeRange[] = [];
    const newChangeRanges: ChangeRange[] = [];

    // Iterate over the transaction steps
    transaction.steps.forEach((step) => {
      const stepMapping = step.getMap();

      // Iterate over the changed ranges in the step mapping
      stepMapping.forEach((oldStart, oldEnd, newStart, newEnd) => {
        // Merge the old range with existing old change ranges
        mergeRange(oldChangeRanges, oldStart, oldEnd);
        // Merge the new range with existing new change ranges
        mergeRange(newChangeRanges, newStart, newEnd);
      });
    });

    oldChangeRanges.forEach(({ from, to }) => {
      oldState.doc.nodesBetween(from, to, (oldNode, oldPos) => {
        if (oldNode.type.name === "note") {
          const newPos = transaction.mapping.mapResult(oldPos).pos;
          const newNode = newPos !== null && newState.doc.nodeAt(newPos);
          if (newNode && newNode.type.name === "note") {
            if (!oldNode.eq(newNode)) {
              changes.set(newNode, "update");
            }
          } else {
            changes.set(oldNode, "delete");
          }
        }
      });
    });

    newChangeRanges.forEach(({ from, to }) => {
      newState.doc.nodesBetween(from, to, (newNode, newPos) => {
        if (newNode.type.name === "note") {
          const oldPos = transaction.mapping.invert().map(newPos);
          const oldNode = oldPos !== null && oldState.doc.nodeAt(oldPos);
          if (!oldNode || oldNode.type.name !== "note") {
            changes.set(newNode, "create");
          }
        }
      });
    });

    return changes;
  }

  function mergeRange(ranges: ChangeRange[], from: number, to: number) {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      if (from <= range.to && to >= range.from) {
        // Overlapping range found, merge it
        range.from = Math.min(range.from, from);
        range.to = Math.max(range.to, to);
        return;
      }
    }
    // No overlapping range found, add a new range
    ranges.push({ from, to });
  }

  $effect(() => {
    if (!view) return;
    data.notes;
    update();
  });

  $effect(() => {
    if (!suggestionState.open) return;
    moveSuggestions();
  });

  onMount(() => {
    let editorState = EditorState.create({
      doc,
      schema,
      plugins: [
        // labelDecorationPlugin,
        ...autocomplete(autocompleteOptions),
        history(),
        keymap({ "Mod-z": undo, "Mod-shift-z": redo }),
        // keymap(baseKeymap),
      ],
    });
    view = new EditorView(editor, {
      state: editorState,
      dispatchTransaction(transaction) {
        // let newNodes: any[] = [];
        //
        // transaction.steps.forEach((step) => {
        //   if (step instanceof ReplaceStep) {
        //     step.slice.content.forEach((node) => {
        //       newNodes.push(node);
        //     });
        //   }
        // });
        //
        // console.log("Added nodes:", newNodes);
        // console.log(
        //   "Document size went from",
        //   transaction.before.content.size,
        //   "to",
        //   transaction.doc.content.size,
        // );

        let oldState = view.state;
        let newState = oldState.apply(transaction);
        view.updateState(newState);

        const changes = getAffectedNotes(transaction, oldState, newState);
        console.log("changes", changes);
        const isExternal = transaction.getMeta("external");
        if (!isExternal) {
          saveChanges(changes);
        }
      },
    });
  });

  async function saveChanges(
    changes: Map<Node, "create" | "delete" | "update">,
  ) {
    for (const [node, change] of changes) {
      const id = node.attrs.id;
      switch (change) {
        case "create":
          await submitNote(id, toContent(node));
          break;
        case "delete":
          await deleteNote(id);
          break;
        case "update":
          await updateNote(id, toContent(node));
          break;
      }
    }
    if (changes.size > 0) {
      await invalidate("view:notes");
    }
  }

  async function handleSubmit(value: string) {
    console.log("submitting", value);
    await submitNote(nanoid(10), value);
    await invalidate("view:notes");
  }

  $inspect(suggestionState);

  async function handleChatClick() {
    // fetch previous chat
    const chat = await useDb().query.chatTable.findFirst({
      orderBy: desc(chatTable.createdAt),
    });
    if (chat) {
      await goto(`/thread/${$page.params.slug}/chat/${chat.id}`);
      return;
    }

    // otherwise create new chat
    const id = await createChat($page.params.slug);
    await goto(`/thread/${$page.params.slug}/chat/${id}`);
  }
</script>

<div class="mx-auto flex w-[100ch] flex-row items-center gap-2 pb-2 pt-2">
  <h1 class="shrink-0 whitespace-nowrap text-3xl font-semibold tracking-tight">
    {data.pageName}
  </h1>
  <Button variant="ghost" class="cursor-pointer" onclick={handleChatClick}>
    <MessageCircleIcon size="24" class="text-gray-700" />
  </Button>
</div>
<main class="flex flex-1 flex-col overflow-y-auto">
  <div class="mx-auto w-[100ch]">
    <!--{#each data.notes as note, index (note.id)}-->
    <!--  <NoteItem-->
    <!--    onFocus={() => (focusIndex = index)}-->
    <!--    focused={focusIndex === index}-->
    <!--    {note}-->
    <!--  />-->
    <!--{/each}-->
    <div class="stack" bind:this={editor}></div>
    <Suggestions open={suggestionState.open} filter={suggestionState.filter} />
  </div>
</main>
<div class="sticky bottom-0 mx-auto w-[100ch] pb-4 pt-2">
  <Card>
    <CardContent class="p-2">
      <Editor resetOnSubmit={true} bind:content onSubmit={handleSubmit} />
    </CardContent>
  </Card>
</div>

<slot />

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
