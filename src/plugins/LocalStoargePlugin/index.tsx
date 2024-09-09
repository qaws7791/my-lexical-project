import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { isEqual } from "lodash-es";
import useThrottle from "../../hooks/useThrottle";
import { EditorState } from "lexical";

const LOCAL_STORAGE_KEY = "editorState";

function loadStateFromLocalStorage(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}

function saveStateToLocalStorage(data: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY, data);
}

export default function LocalStoragePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const throttledSave = useThrottle(
    (editorState: EditorState, prevEditorState: EditorState) => {
      const json = editorState.toJSON();
      const prevJson = prevEditorState.toJSON();
      if (isEqual(json, prevJson)) return;
      console.log("throttledSave");
      saveStateToLocalStorage(JSON.stringify(json));
    },
    3000
  );

  useEffect(() => {
    if (!isFirstRender) return;
    setIsFirstRender(false);
    const json = loadStateFromLocalStorage();
    if (!json) return;
    const editorState = editor.parseEditorState(JSON.parse(json));
    editor.setEditorState(editorState);
  }, [isFirstRender, editor]);

  useEffect(() => {
    const listener = editor.registerUpdateListener(
      ({ editorState, prevEditorState }) => {
        throttledSave(editorState, prevEditorState);
      }
    );

    return () => {
      listener();
    };
  }, [editor, throttledSave]);

  return null;
}
