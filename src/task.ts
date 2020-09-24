import * as vscode from 'vscode';
import { textEditorDecorationTypeHighlight } from './config';
import { CHINESE_WORDS_REGEX } from './constants';

export const detectChineseWords = (textEditor: vscode.TextEditor | undefined) => {
  if (!textEditor) {
    // Display a message box to the user
    vscode.window.showInformationMessage('No active file from charset-detector!');
    return;
  }

  clearDecorations(textEditor);

  // check document line by line
  const lineCount = textEditor.document.lineCount;
  const ranges: vscode.Range[] = [];
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const textLine = textEditor.document.lineAt(lineIndex);
    if (CHINESE_WORDS_REGEX.test(textLine.text)) {
      ranges.push(textLine.range);
    }
  }

  // apply decorations to matched lines
  textEditor.setDecorations(textEditorDecorationTypeHighlight, ranges);

  // debugger info
  console.log(ranges);
};

export const clearDecorations = (textEditor: vscode.TextEditor) => {
  // clear all decorations 
  textEditor.setDecorations(textEditorDecorationTypeHighlight, []);
};