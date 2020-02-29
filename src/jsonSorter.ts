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

        prev[key] = !Array.isArray(value) && typeof value === 'object' ? sorter(JSON.stringify(value), desc) : value

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
  if (typeof content !== 'string') {
    throw new Error('Current file is not a valid JSON file.')
  }

  try {
    const result = await sorter(content, desc || false)
    editor?.edit(builder => {
      builder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(999999, 0)))
      builder.insert(new vscode.Position(0, 0), JSON.stringify(result, null, 2))
    })
  } catch (error) {
    vscode.window.showErrorMessage('[JSON Sorter]', error)
  }
}

export default jsonSorter
