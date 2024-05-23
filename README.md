# threads

## TODO

- [x] Create linked pages on submit
- [x] Link pages in note content
- [x] Chatbot and chat schema
- [ ] Start a chat with @ mention
  - [ ] autocomplete @ mentions
- [ ] Positive and negative filter a thread by adding slugs
- [ ] Add URLs, tweets, videos to notes
- [ ] Save note on change
- [ ] Up/down arrows to move between notes
  - [ ] Maintain cursor position
  - [ ] Down on last note to go to message input
  - [ ] Up arrow on message input to go to previous note
- [ ] Show widgets when note unfocused



## UX Choices

**Note list order**

New note on top or bottom. On top is how I journal, on the bottom is more like a chat.

**Editor submit method**

Enter to submit favours quick submission of single link notes. Ctrl+enter favours typing multi-line notes.

**Create page links**

Obsidian style `[[page]]` links vs `#tag` style. Bracket links support spaces. Tag links have less noisy characters 
but require formatting for longer page names 

**Slug**

Slug is a unique identifier for a page that can be used in URLs. It is generated from the page name. It should be possible to calculate the slug without the database. 

