# @rosemlab/dom-metric

## List of all boxes

- marginBox
- borderBox
- boundingBox / overflowBox (include scrollbars)
- paddingBox (exclude scrollbars)
- scrollBox
- contentBox / clientBox
- textBox
- transformBox

## Text box

```
text
```

## Content box / Client box

```
+---------+
| text    |
+---------+
```

## Padding box

```
+---------------+
|  padding      |
|  +---------+  |
|  | text    |  |
|  +---------+  |
+---------------+
```

## Bounding box

```
+---------------+---+
|  padding      | scrollbar
|  +---------+  |   |
|  | text    |  |   |
|  +---------+  |   |
+---------------+---+
|  scrollbar    |   |
+---------------+---+
```
