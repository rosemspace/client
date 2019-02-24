import OperationList from './OperationList'
import VirtualHost from '@rosem/virtual-dom/VirtualHost'
import OperationListInterface from '@rosem/virtual-dom/OperationListInterface'

const operationList: OperationListInterface<
  Node,
  Element,
  Text,
  Comment
> = new OperationList()

const vHost = new VirtualHost()

const h = vHost.createVirtualInstance

export default function() {
  const vnode = h(
    'svg',
    {
      namespace: 'http://www.w3.org/2000/svg',
      attrs: {
        viewBox: '0 0 100 150',
      },
    },
    [
      h('P', undefined, 'pipi'),
      h('use', {
        attrs: {
          'xlink:href': {
            namespace: 'http://www.w3.org/1999/xlink',
            value: '#icon-test',
          },
        },
      }),
      h('ul', [
        h(1, 'Some text'),
        h(2, 'Some comment'),
        h('li', 'item 1'),
        h('li', ['item 2']),
      ]),
    ]
  )
  console.log(vnode);

  return vHost.renderVirtualInstance(vnode, operationList)
}
