import * as vscode from 'vscode'
import * as jju from 'jju'

const JSON5 = {
  parse: jju.parse,
  stringify: (value: object) =>
    jju.stringify(value, {
      quote: '"',
      indent: 2,
      no_trailing_comma: true,
      quote_keys: true,
    }),
}

const sorter = (json: string, desc?: boolean): object => {
  try {
    const data = JSON5.parse(json)
    const result = Object.keys(data)
      .map((key) => key)
      .sort((a, b) => {
        const seed = desc ? -1 : 1

        let chartIndex = 0
        let diffOfCharCode = a.charCodeAt(chartIndex) - b.charCodeAt(chartIndex)
        while (diffOfCharCode === 0) {
          chartIndex += 1
          if (Number.isNaN(a.charCodeAt(chartIndex))) {
            diffOfCharCode = -1
            break
          }
          if (Number.isNaN(b.charCodeAt(chartIndex))) {
            diffOfCharCode = 1
            break
          }
          diffOfCharCode = a.charCodeAt(chartIndex) - b.charCodeAt(chartIndex)
          if (diffOfCharCode !== 0) break
        }

        return seed * diffOfCharCode
      })
      .reduce((prev: any, curr: any) => {
        const key = curr
        const value = data[key]

        if (Array.isArray(value)) {
          prev[key] = value.map((item) => {
            if (['string', 'boolean', 'number', 'bigint'].includes(typeof item) || Array.isArray(item)) return item
            if (typeof item === 'object') return sorter(JSON5.stringify(item), desc)

            return item
          })
        } else if (typeof value === 'object') {
          prev[key] = sorter(JSON5.stringify(value), desc)
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
  try {
    const editor = vscode?.window?.activeTextEditor
    const content = editor?.document.getText()
    if (typeof content !== 'string' || !editor || !['json', 'jsonc'].includes(editor.document.languageId))
      throw new Error('Current file is not a valid JSON/JSON5 file!')

    const result = await sorter(content, desc || false)
    editor?.edit((builder) => {
      builder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount, 0)))
      builder.insert(new vscode.Position(0, 0), JSON5.stringify(result))
    })
  } catch (error) {
    vscode.window.showErrorMessage('[JSON Sorter] ' + error.message || 'Error')
  }
}

export default jsonSorter
