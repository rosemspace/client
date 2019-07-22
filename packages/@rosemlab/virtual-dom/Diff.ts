const html = `
<h1>Title</h1>
<div id="app" class="box">
  <section>
    <h2>List</h2>
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  </section>
</div>
`
const html2 = `
<h1>Name</h1>
<div id="menu" class="container">
  <section>
    <h2>List</h2>
    <ul>
      <li>1</li>
      <li>3</li>
    </ul>
  </section>
  <p>description</p>
</div>
`

import { VirtualAttr, VirtualInstance } from '.'

enum DiffType {
  NODE_ADD,
  NODE_MOVE,
  NODE_REMOVE,
  ATTR_CHANGE,
  ATTR_REMOVE,
  TEXT_CHANGE,
}

export interface DiffGroup {
  index: number
  diffList: Diff[]
}

export default interface Diff {
  type: DiffType
  key?: string
  // value: VirtualInstance | VirtualAttr
  value?: string
  // a?: VirtualInstance
  // b?: VirtualInstance
}

export interface DiffNode {
  path: number[]
  diffGroupList: DiffGroup[]
  next?: DiffNode
}

const diff: DiffNode = {
  path: [],
  diffGroupList: [
    {
      index: 0,
      diffList: [
        {
          type: DiffType.TEXT_CHANGE,
          value: 'Name',
        },
      ],
    },
    {
      index: 1,
      diffList: [
        {
          type: DiffType.ATTR_CHANGE,
          key: 'id',
          value: 'menu',
        },
        {
          type: DiffType.ATTR_CHANGE,
          key: 'class',
          value: 'container',
        },
      ],
    },
  ],
  next: {
    path: [1],
    diffGroupList: [
      {
        index: 1,
        diffList: [
          {
            type: DiffType.NODE_ADD,
            key: 'p',
          },
          {
            type: DiffType.TEXT_CHANGE,
            value: 'description',
          },
        ],
      },
    ],
    next: {
      path: [0, 1],
      diffGroupList: [
        {
          index: 1,
          diffList: [
            {
              type: DiffType.NODE_REMOVE,
            },
          ],
        },
      ],
    },
  },
}
