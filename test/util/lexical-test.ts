import { createEditor, type LexicalEditor } from "lexical";
import { mergeRegister } from "@lexical/utils";

export abstract class LexicalTest {
  editor: LexicalEditor;
  _resolve: () => void;
  _reject: (e: any) => void;
  _cleanUp: () => void = () => {};

  constructor(resolve: () => void, reject: (e: any) => void) {
    this._resolve = resolve;
    this._reject = reject;
    this.editor = createEditor({
      onError: this.reject.bind(this),
      ...this.config(),
    });
    this.editor.update(() => {
      try {
        this.populate();
      } catch (e) {
        this._reject(e);
      }
    });
    this._cleanUp = mergeRegister(
      this.register(),
      this.editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          try {
            this.expect();
            this.resolve();
          } catch (e) {
            this.reject(e);
          }
        });
      }),
    );
  }

  abstract config(): Record<string, any>;

  abstract register(): () => void;

  abstract populate(): void;

  abstract expect(): void;

  cleanUp() {
    this._cleanUp();
    this.editor = null!;
  }

  resolve() {
    this.cleanUp();
    this._resolve();
  }

  reject(e: any) {
    this.cleanUp();
    this._reject(e);
  }
}

export function createLexicalTest<T extends LexicalTest>(
  cls: new (...args: ConstructorParameters<typeof LexicalTest>) => T,
) {
  return async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        new cls(resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  };
}
