
import * as vscode from 'vscode';
export interface ExtensionConfig {
  extensions: string[];
  ignore: string[];
  zh_path: string;
  en_path: string;
}

export interface DocumentDetectResult {
  ranges: vscode.Range[];
  texts: string[];
}