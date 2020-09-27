// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearDecorations, createMessage, detectChineseWordsinTextEditor, detectChineseWordsinWorkspace } from './task';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "charset-detector" is now active!');

  let _disableHighlight = true;
  let _disableDiagnostics = true;
  let _watchTextEditorSave__highlight: vscode.Disposable;
  let _watchTextEditorChange__highlight: vscode.Disposable;
  let _watchTextEditorSave__diagnostics: vscode.Disposable;
  const collections = vscode.languages.createDiagnosticCollection('Detector');

  const clearDiagnosticCollection = () => {
    console.log('clear DiagnosticCollection');
    collections.clear();
  };

  // generate a SaveTextDocument Event listener
  const watchTextEditorSave = (callBack: (e: vscode.TextDocument) => any) => {
    return vscode.workspace.onDidSaveTextDocument(callBack);
  };

  const watchTextEditorChange = (callBack: (e: vscode.TextEditor | undefined) => any) => {
    return vscode.window.onDidChangeActiveTextEditor(callBack);
  };


  // activate extension 
  const _activate = () => {

    // new a listener and subscribe it 
    _watchTextEditorSave__highlight = watchTextEditorSave(detectChineseWordsinTextEditor);
    context.subscriptions.push(_watchTextEditorSave__highlight);
    _watchTextEditorChange__highlight = watchTextEditorChange(detectChineseWordsinTextEditor);
    context.subscriptions.push(_watchTextEditorChange__highlight);

    _disableHighlight = false;
    detectChineseWordsinTextEditor();
  };


  // deativate extension
  const _deativate = () => {

    // unsubscribe the listener
    _watchTextEditorSave__highlight.dispose();
    _watchTextEditorChange__highlight.dispose();
    _disableHighlight = true;

    //
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    clearDecorations(activeTextEditor);

  };

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let _enable__highlight = vscode.commands.registerCommand('charset-detector.enableHighlight', () => {
    // The code you place here will be executed every time your command is executed

    if (_disableHighlight) {
      _activate();
    } else {
      _deativate();
    }

  });

  let _disable__highlight = vscode.commands.registerCommand('charset-detector.disableHighlight', () => {
    if (!_disableHighlight) {
      _deativate();
    }
  });


  // will watch the workspace and show results in [PROBLEMS] panel
  let _enable__diagnostics = vscode.commands.registerCommand('charset-detector.enableWorkspaceDiagnostics', () => {

    if (!_disableDiagnostics) {
      return;
    }
    _disableDiagnostics = false;
    const projects = vscode.workspace.workspaceFolders;
    if (!projects) {
      vscode.window.showInformationMessage('No file found.');
      return;
    }

    // 
    let _project = projects[0];
    if (projects.length > 1) {
      vscode.window.showQuickPick(projects.map((p) => p.name)).then((name) => {
        if (name) {
          _project = (projects.find((p) => p.name === name))!;
        }
      });
    }
    detectChineseWordsinWorkspace(collections, _project);

    //
    _watchTextEditorSave__diagnostics = watchTextEditorSave(() => detectChineseWordsinWorkspace(collections, _project));
    context.subscriptions.push(_watchTextEditorSave__diagnostics);

  });

  let _disable__diagnostics = vscode.commands.registerCommand('charset-detector.disableWorkspaceDiagnostics', () => {
    if (_disableDiagnostics) {
      return;
    }
    _disableDiagnostics = true;
    _watchTextEditorSave__diagnostics.dispose();
    clearDiagnosticCollection();
  });

  let _createMessage = vscode.commands.registerCommand('charset-detector.createLocaleMessage', () => {
    createMessage();
  });

  context.subscriptions.push(_enable__highlight);
  context.subscriptions.push(_disable__highlight);
  context.subscriptions.push(_enable__diagnostics);
  context.subscriptions.push(_disable__diagnostics);
  context.subscriptions.push(_createMessage);
}

// this method is called when your extension is deactivated
export function deactivate() { }
