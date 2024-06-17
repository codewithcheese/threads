- [ ] split note nodes with `---` hr
- [ ] hash commands
- [ ] slash commands

---

- [ ] use Svelte components to render lexical nodes
  - unmount component when node is deleted
- [ ] select note node
- [ ] serialize svelte component state to json
- [ ] drag and drop note node
  - https://github.com/notjustinshaw/wikigora/blob/main/src/app/plugins/DraggableBlockPlugin/index.tsx
- [x] create a note node, that can contain, text, tags and embeds
  - use element node 
- [x] detect when a note is updated, created, deleted
  - registerUpdateListener, registerMutationListener
- [x] prevent nesting of notes during copy and paste
  - excludeFromCopy=true
- [x] join note nodes when deleting
  - default behavior
