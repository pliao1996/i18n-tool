import * as vscode from 'vscode';
import { textEditorDecorationTypeHighlight } from './config';
import { CHINESE_WORDS_REGEX } from './constants';
import { DocumentDetectResult } from './interface';

export const createMessage = (textEditor: vscode.TextEditor | undefined) => {
  if (!textEditor) {
    // Display a message box to the user
    vscode.window.showInformationMessage('There is no open file!');
    return;
  }
  const config = getWorkspaceConfig();


};

//
export const detectChineseWordsinWorkspace = (collection: vscode.DiagnosticCollection, project: vscode.WorkspaceFolder) => {
  const projectDocuments = vscode.workspace.textDocuments.filter(doc => doc.fileName.includes(project.uri.fsPath));
  const visibleDocuments = vscode.window.visibleTextEditors.map((editor) => editor.document);
  addDocumentsDiagnostictoCollection(collection, [...projectDocuments, ...visibleDocuments]);
};


// 
const getWorkspaceConfig = () => {
  const extensions = vscode.workspace.getConfiguration('charset-detector.extensions');
  const ignore = vscode.workspace.getConfiguration('charset-detector.ignore');
  const en = vscode.workspace.getConfiguration('charset-detector.wordlib.en');
  const zh = vscode.workspace.getConfiguration('charset-detector.wordlib.zh');
  return { extensions, ignore, wordlib: { en, zh } };
};


// add documents diagnostic to vscode diagnostic collection
const addDocumentsDiagnostictoCollection = (collection: vscode.DiagnosticCollection, documents: vscode.TextDocument[]) => {
  documents.forEach((document) => {
    collection.set(document.uri, getDocumentDiagnostic(document));
  });
};

// get document diagnostics
function getDocumentDiagnostic(document: vscode.TextDocument): vscode.Diagnostic[] {
  const results = detectDocumentWordsRangeandTexts(document);
  return revertResultstoDiagnostic(results);
}

// revert results to diagnostics
function revertResultstoDiagnostic(results: DocumentDetectResult): vscode.Diagnostic[] {
  return results.ranges.map((range: vscode.Range, index) => {
    return {
      message: results.texts[index],
      range: range,
      severity: vscode.DiagnosticSeverity.Information,
      source: 'Detector'
    };
  });
}

// find the ranges and texts of Chinese words in a document
function detectDocumentWordsRangeandTexts(document: vscode.TextDocument): DocumentDetectResult {
  // check document line by line
  const lineCount = document.lineCount;
  const ranges: vscode.Range[] = [];
  const texts: string[] = [];
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const textLine = document.lineAt(lineIndex);
    if (textLine.text.match(CHINESE_WORDS_REGEX)) {
      ranges.push(textLine.range);
      texts.push(textLine.text.match(CHINESE_WORDS_REGEX)![0].toString());
    }
  }
  return { ranges, texts };
}

// highlight lines in active textEditor
export const detectChineseWordsinTextEditor = () => {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    // Display a message box to the user
    vscode.window.showInformationMessage('There is no open file!');
    return;
  }

  clearDecorations(textEditor);

  const ranges = detectDocumentWordsRangeandTexts(textEditor.document).ranges;

  if (ranges.length === 0) {
    // no Chinese words found
    vscode.window.showInformationMessage('No Chinese words found.');
    return;
  }

  // apply decorations to matched lines
  textEditor.setDecorations(textEditorDecorationTypeHighlight, ranges);

  // debugger info
  console.log(ranges);
};

export const clearDecorations = (textEditor: vscode.TextEditor) => {
  // clear all decorations 
  textEditor.setDecorations(textEditorDecorationTypeHighlight, []);
  console.log('clear decorations');
};