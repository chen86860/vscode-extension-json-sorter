import * as vscode from 'vscode'

const sorter = (string: string, desc?: boolean): object => {
  try {
    const data = JSON.parse(string)
    const result = Object.keys(data)
      .map(key => key)
      .sort((a, b) => (a.charCodeAt(0) - b.charCodeAt(0)) * (desc ? -1 : 1))
      .reduce((prev: any, curr: any) => {
        const key = curr
        const value = data[key]

        if (Array.isArray(value)) {
          prev[key] = value.map(item => {
            if (['string', 'boolean', 'number', 'bigint'].includes(typeof item) || Array.isArray(item)) return item
            if (typeof item === 'object') return sorter(JSON.stringify(item), desc)

            return item
          })
        } else if (typeof value === 'object') {
          prev[key] = sorter(JSON.stringify(value), desc)
        } else {
          prev[key] = value
        }

        return prev
      }, {})

    return result
  } catch (error) {
    throw error
  }
}

const jsonSorter = async (desc?: boolean) => {
  const editor = vscode.window.activeTextEditor
  const content = editor?.document.getText()
  if (typeof content !== 'string') throw new Error('Current file is not a valid JSON file.')

  try {
    const result = await sorter(content, desc || false)
    editor?.edit(builder => {
      builder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(999999, 0)))
      builder.insert(new vscode.Position(0, 0), JSON.stringify(result, null, 2))
      // vscode.commands.executeCommand('editor.action.formatDocument')
    })
  } catch (error) {
    vscode.window.showErrorMessage('[JSON Sorter]', error)
  }
}

export default jsonSorter
