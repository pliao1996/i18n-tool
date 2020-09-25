import * as vscode from 'vscode';

// define hightlight TextDecoration for matched lines
export const textEditorDecorationTypeHighlight = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: new vscode.ThemeColor('editor.selectionBackground'),
  overviewRulerColor: 'yellow'
});

export interface ExtensionConfig {
  extensions: string[];
  ignore: string[];
  wordlib: {
    en: string;
    zh: string;
  }
}

export interface DocumentDetectResult {
  ranges: vscode.Range[];
  texts: string[];
}