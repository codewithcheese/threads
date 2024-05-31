import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { type EditorState, RangeSetBuilder } from "@codemirror/state";
import { slugify } from "$lib/slugify";

let linkRegex = /\[\[([^\]]|](?!]))*/g;

class DocumentLinkWidget extends WidgetType {
  constructor(public name: string) {
    super();
  }
  eq(other: DocumentLinkWidget) {
    return other.name === this.name;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "link-widget";
    span.setAttribute("data-sveltekit-preload-data", "false");
    span.innerHTML = `<a href="/thread/${slugify(this.name)}">${this.name}</a>`;
    return span;
  }
}

// class DocumentCreateWidget extends WidgetType {
//   constructor(public name: string) {
//     super();
//   }
//   toDOM() {
//     const span = document.createElement("span");
//     span.className = "document-icon";
//     span.innerHTML =
//       '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>';
//     span.onclick = () => {
//       goto(`/document/new?name=${encodeURIComponent(this.name)}`);
//     };
//     return span;
//   }
// }

export const linkWidget = ViewPlugin.fromClass(
  class {
    view: EditorView;
    decorations: DecorationSet = new RangeSetBuilder<Decoration>().finish();

    constructor(view: EditorView) {
      this.view = view;
      this.buildDecorations(view.state);
    }
    destroy() {}
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.buildDecorations(update.state);
      }
    }

    async buildDecorations(state: EditorState) {
      let builder = new RangeSetBuilder<Decoration>();
      const re = linkRegex;
      let match: RegExpExecArray | null;
      const docStr = state.doc.toString();
      const cursor = state.selection.main.head;

      while ((match = re.exec(docStr)) !== null) {
        const start = match.index;
        const end = start + match[0].length + 2;
        const name = match[0].slice(2);
        const isInsideRange = cursor >= start && cursor <= end;
        if (!isInsideRange) {
          builder.add(
            start,
            end,
            Decoration.replace({
              widget: new DocumentLinkWidget(name),
              inclusive: true,
              block: false,
              editing: true,
            }),
          );
        }
      }
      this.decorations = builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
