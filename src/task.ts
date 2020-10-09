import * as vscode from 'vscode';
import * as fs from 'fs';
import { textEditorDecorationTypeHighlight } from './config';
import { CHINESE_WORDS_REGEX } from './constants';
import { DocumentDetectResult, ExtensionConfig } from './interface';
import { deepmerge, pathExists } from './utils';

export const createMessage = () => {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    // Display a message box to the user
    vscode.window.showInformationMessage('You should open a file :)');
    return;
  }

  if (!textEditor.selection) {
    vscode.window.showInformationMessage('You should select a position to insert message :)');
    return;
  }
  const selectedRange = new vscode.Range(textEditor.selection.start, textEditor.selection.end);
  const anchor = textEditor.selection.anchor;
  const message = textEditor.document.getText(selectedRange);

  vscode.window.showInputBox({ prompt: 'type message id above' }).then((id) => {

    if (!id) {
      return;
    }

    if (textEditor.selection.isEmpty) {
      textEditor.edit((editBuilder) => editBuilder.insert(anchor, `\"${id}\"`));
    } else {
      textEditor.edit((editBuilder) => { editBuilder.replace(textEditor.selection, `\"${id}\"`); });
    }
    if (id) {
      createMessageId(id, message);
    }
  });

};

const createMessageId = (messageId: string, message: string) => {
  const { en_path, zh_path } = getWorkspaceConfig();
  [en_path, zh_path].forEach((_path) => {
    const messages = pathExists(_path) ? JSON.parse(fs.readFileSync(_path, 'utf-8')) : {};
    const newMessages = insertMessage(messages, messageId.split('.'), message);
    try {
      fs.writeFileSync(_path, JSON.stringify(newMessages, null, 2));
    } catch (error) {
      console.log(error);
      vscode.window.showInformationMessage(`no such file or directory, open ${_path}`);
    }
  });
};

function insertMessage(messages: any, ids: string[], message: string) {
  function createNewMessage(ids: string[], message: string | object): string | object {
    if (ids.length > 0) {
      return createNewMessage(ids.slice(0, ids.length - 1), { [ids[ids.length - 1]]: message });
    } else {
      return message;
    }
  }
  const newMessage = createNewMessage(ids, message);
  console.log("insert:", newMessage);
  return deepmerge(messages, newMessage);
}

// TODO: textDocuments aren't all files
export const detectChineseWordsinWorkspace = (collection: vscode.DiagnosticCollection, project: vscode.WorkspaceFolder) => {
  const projectDocuments = vscode.workspace.textDocuments.filter(doc => doc.fileName.includes(project.uri.fsPath));
  const visibleDocuments = vscode.window.visibleTextEditors.map((editor) => editor.document);
  addDocumentsDiagnostictoCollection(collection, [...projectDocuments, ...visibleDocuments]);
};


// 
function getWorkspaceConfig(): ExtensionConfig {
  const configuration = vscode.workspace.getConfiguration('i18n-tool');
  const extensions = configuration['extensions'];
  const ignore = configuration['ignore'];
  const en_path = configuration['en-path'];
  const zh_path = configuration['zh-path'];
  return { extensions, ignore, en_path, zh_path };
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
      source: 'i18n-tool'
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