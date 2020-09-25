// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearDecorations, detectChineseWordsinTextEditor, detectChineseWordsinWorkspace } from './task';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "charset-detector" is now active!');

  let disable = true;
  let _watch: vscode.Disposable[];
  const collections = vscode.languages.createDiagnosticCollection('Detector');;
  // generate a disposable to watch text change
  const watch = () => {
    return [
      vscode.workspace.onDidChangeTextDocument(() => {
        detectChineseWordsinTextEditor(vscode.window.activeTextEditor);
      }),
      vscode.window.onDidChangeActiveTextEditor(() => {
        detectChineseWordsinTextEditor(vscode.window.activeTextEditor);
      }),
    ];
  };

  // activate extension 
  const activate = () => {

    // new a listener and subscribe it 
    _watch = watch();
    context.subscriptions.push(..._watch);
    disable = false;

    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      // Display a message box to the user
      vscode.window.showInformationMessage('There is no open file!');
      return;
    }
    // 
    detectChineseWordsinTextEditor(vscode.window.activeTextEditor);
  };

  // deativate extension
  const deativate = () => {

    // unsubscribe the listener
    _watch.forEach((watch) => watch.dispose());
    disable = true;

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
  let _enable = vscode.commands.registerCommand('charset-detector.enableHightlight', () => {
    // The code you place here will be executed every time your command is executed

    if (disable) {
      activate();
    } else {
      deativate();
    }

  });

  let _disable = vscode.commands.registerCommand('charset-detector.disableHightlight', () => {
    if (!disable) {
      deativate();
    }
  });

  let _run = vscode.commands.registerCommand('charset-detector.detectWorkspace', () => {
    const projects = vscode.workspace.workspaceFolders;
    if (!projects) {
      vscode.window.showInformationMessage('No file found.');
      return;
    }
    collections.clear();
    if (projects.length > 1) {
      vscode.window.showQuickPick(projects.map((p) => p.name)).then((name) => {
        if (name) {
          const project = projects.find((p) => p.name === name);
          detectChineseWordsinWorkspace(collections, project!);
        }
      });
    } else {
      detectChineseWordsinWorkspace(collections, projects[0]);
    }
    console.log(projects);
  });

  context.subscriptions.push(_enable);
  context.subscriptions.push(_disable);
  context.subscriptions.push(_run);
}

// this method is called when your extension is deactivated
export function deactivate() { }
