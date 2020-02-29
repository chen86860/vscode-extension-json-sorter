import * as vscode from 'vscode'
import jsonSorter from './jsonSorter'

export function activate(context: vscode.ExtensionContext) {
  const jsonSorterDisposable = vscode.commands.registerCommand('extension.jsonSorter', () => jsonSorter())

  const jsonSorterDescDisposable = vscode.commands.registerCommand('extension.jsonSorterDesc', () => jsonSorter(true))

  context.subscriptions.push(jsonSorterDisposable)
  context.subscriptions.push(jsonSorterDescDisposable)
}

export function deactivate() {}
