// import Transition from '@rosem/ui-transition/Transition'
//
// const t = new Transition(host.body)
// console.log(t)

import Reaction from '@rosem/observable'
import Transition from '@rosem/ui-transition'
import { h, host, vHost } from '@rosem/vdom-html'
import TemplateParser from '@rosem/template-parser'

// @ts-ignore
window.h = h
// @ts-ignore
window.host = host
// @ts-ignore
window.vHost = vHost

new TemplateParser().parseFromString(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
<div>
  <p>Paragraph 1
  <p>Paragraph 2
  <ul>
      <li>List item 1
      <li>List item 2
      <li>List item 3</li>
  </ul>
</div>
<svg width="4in" height="3in"
     xmlns="http://www.w3.org/2000/svg">
  <desc>This graphic links to an external image
  </desc>
  <image x="200" y="200" width="100px" height="100px"
         href="myimage.png">
    <title>My image</title>
  </image>
</svg>
<svg viewBox="0 0 200 200">
  <!--xmlns="http://www.w3.org/2000/svg"-->
  <style>
  polygon { fill: black }

  div {
    color: white;
    font:18px serif;
    height: 100%;
    overflow: auto;
  }
  </style>

  <polygon points="5,5 195,10 185,185 10,195" />

  <!-- Common use case: embed HTML text into SVG -->
  <foreignObject x="20" y="20" width="160" height="160">
    <!--
      In the context of SVG embeded into HTML, the XHTML namespace could
      be avoided, but it is mandatory in the context of an SVG document
    -->
    <div xmlns="http://www.w3.org/1999/xhtml">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat.
    </div>
  </foreignObject>
</svg>
</body>
</html>
`)
// Transition.test();
// Reaction.test()
