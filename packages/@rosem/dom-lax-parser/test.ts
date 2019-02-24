import DOMLaxParser from './DOMLaxParser'

export default function () {
  return new DOMLaxParser().parseFromString(`
<!doctype html>
<!--<html lang="en">-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<!--<body>-->
<svg>
  <use xlink:href="icons.svg#test"/>
</svg>
<div>Test of <![cond]> <![CDATA[ok]]> section</div>
<div>
  <p>Paragraph 1
  <p>Paragraph 2
  <ul>
      <li>List item 1
      <li>List item 2
      <li>List item 3</li>
  </ul>
</div>
<math>
    <!--xmlns="http://www.w3.org/1998/Math/MathML"-->
    <mrow>
        <mo>=</mo>
        <msup>
            <mrow>
                <mi>a</mi>
            </mrow>
            <mn>2</mn>
        </msup>
    </mrow>
</math>
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
    <div >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat.
      <pre>
          svg
      </pre>
    </div>
  </foreignObject>
</svg>
<div class="test"></div>
<!--</body>-->
<...
`)
}
