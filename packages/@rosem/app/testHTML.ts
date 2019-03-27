export default `
<!doctype html>
<?php echo 'test'; ?>
<!doctype html>
</br></hr>
<!NOTe test>
<div></div></>text
<span></span>text</li>
<!--<html lang="en">-->
<![if !IE]>
<link href="non-ie.css" rel="stylesheet">
<![endif]>
<table>
<thead>
  <tr>
    <th>Table heading 1
    <th>Table heading 2
<tbody>
  <tr>
    <td colspan="2">Column data 1
    <td>Column data 2
</tbody>
<tfoot>
  <tr rowspan="2">
    <td>Table footer
</table>
<br>
<!--<li>ppp-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document of <title></title>
</head>
<!--<body>-->
<svg>
  <use xlink:href="icons.svg#test"/>
</svg>
<div>Test of <![cond]> <![CDATA[ok]>]]> section</div>
<div>
  <p>Paragraph 1
  <p>Paragraph 2
  <!--<article>non-phrasing element</article>-->
  <ul>
      <li>List item 1
      <li>List item 2
      <li>List item 3
  </ul>
</div>
<script >var test1 = 'testValue1';</script>
<script><![CDATA[
var test2 = 'testValue2';

if (test < 0) {
  console.log('<div>DIV</div>');
}
]]></script>
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
<0,;
`
