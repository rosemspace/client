import { plugin, Transformer, Root } from 'postcss'

export default plugin(
  'trim',
  (): Transformer => (css: Root): void => {
    css.walk(({ type, raws }): void => {
      if (type === 'rule' || type === 'atrule') {
        if (raws.before) {
          raws.before = '\n'
        }

        if (raws.after) {
          raws.after = '\n'
        }
      }
    })
  }
)
