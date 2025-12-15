// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Editor, EditorPosition } from "obsidian";
import { WidgetType, EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { TextCleanup } from "../analyzers/TextCleanup";

class SuggestionWidget extends WidgetType {
    constructor(readonly text: string, readonly onAccept: () => void) {
        super();
    }

    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement("div");
        div.className = "swc-suggestion-widget";
        div.textContent = `Suggested: ${this.text}`;
        div.onclick = this.onAccept;
        return div;
    }
}

export const suggestionField = ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        // Placeholder logic: efficiently finding positions would require a robust state management
        // For now, this acts as a stub for the architecture
        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});
