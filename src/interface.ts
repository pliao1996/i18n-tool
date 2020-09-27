
import * as vscode from 'vscode';
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