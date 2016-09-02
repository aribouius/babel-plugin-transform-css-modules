import postcss from 'postcss'
import Locals from 'postcss-modules-local-by-default'
import Values from 'postcss-modules-values'
import Scope from 'postcss-modules-scope'
import ExtractImports from 'postcss-modules-extract-imports'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'

let config
const defaults = {
  extensions: ['.css']
}

export default function({ types: t }) {
  return {
    visitor: {
      CallExpression(path, state) {
        const { callee: { name }, arguments: [node] } = path.node

        if (name !== 'require' || !node || !t.isStringLiteral(node)) return

        config = config || (function() {
          const opts = { ...defaults, ...state.opts }
          opts.extensions = opts.extensions.map(ext => ext.replace('.', ''))
          return opts
        })()

        const ext = node.value.split('.').slice(-1).join('')
        if (config.extensions.indexOf(ext) === -1) return

        const file = resolve(dirname(state.file.opts.filename), node.value)
        const content = readFileSync(file, 'utf8')

        const out = 'test'

        console.log(postcss([
          Locals,
          Values,
          ExtractImports,
          Scope
        ]).process(content).css)

        path.replaceWith(t.StringLiteral(out))
      }
    }
  }
}
