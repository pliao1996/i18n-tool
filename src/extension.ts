// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearDecorations, detectChineseWords } from './task';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "charset-detector" is now active!');

  let disable = true;
  let _watch: vscode.Disposable;
  const activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    // Display a message box to the user
    vscode.window.showInformationMessage('There is no open file!');
    return;
  }

  // generate a disposable to watch text change
  const watch = () => vscode.workspace.onDidChangeTextDocument(() => {
    detectChineseWords(activeTextEditor);
  });

  // activate extension 
  const activate = () => {
    // new a listener and subscribe it 
    _watch = watch();
    context.subscriptions.push(_watch);
    // 
    detectChineseWords(activeTextEditor);
    disable = false;
  };

  // deativate extension
  const deativate = () => {
    // unsubscribe the listener
    _watch.dispose();
    //
    clearDecorations(activeTextEditor);
    disable = true;
  };

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let start = vscode.commands.registerTextEditorCommand('charset-detector.enableHightlight', () => {
    // The code you place here will be executed every time your command is executed

    if (disable) {
      activate();
    } else {
      deativate();
    }

  });

  let end = vscode.commands.registerTextEditorCommand('charset-detector.disableHightlight', () => {
    if (!disable) {
      deativate();
    }
  });

  context.subscriptions.push(start);
  context.subscriptions.push(end);

}

// this method is called when your extension is deactivated
export function deactivate() { }
