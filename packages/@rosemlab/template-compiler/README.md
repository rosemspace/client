# @rosemlab/template-compiler

## Syntax

```html
<? if (itemCount > 10) { ?>
<ul>
  <? for (let item of itemList) { ?>
  <li>{ item.name }</li>
  <? } ?>
</ul>
<? } ?>
```

```javascript
export default function render() {
  return (createComponent || createElement)(
    'div',
    { staticClass: 'greeting' },
    [createText(`\n Hello ${escapeHTML(vm.name)}!\n`)]
  )
}
```
