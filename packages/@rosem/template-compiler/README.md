# @rosem/template-compiler

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
