function escapeHtml1(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// var BASE_ENTITY_ENCODING_MAP = Object.create(null, {
//   34: {
//     enumerable: true,
//     value: '&quot;', //"
//   },
//   38: {
//     enumerable: true,
//     value: '&amp;', //&
//   },
//   39: {
//     enumerable: true,
//     value: '&#39;', //' &apos;
//   },
//   60: {
//     enumerable: true,
//     value: '&lt;', //<
//   },
//   62: {
//     enumerable: true,
//     value: '&gt;', //>
//   },
// })
var BASE_ENTITY_ENCODING_MAP = {
  34: '&quot;', //"
  38: '&amp;', //&
  39: '&#39;', //' &apos;
  60: '&lt;', //<
  62: '&gt;', //>
}
var BASE_ENTITY_ENCODING_BUFFER = new Uint8Array([34, 38, 39, 60, 62])
//Binary 27^34|5
// 1byte = 8bit = 2^8 = 255 = 0xff
//32 - 100000
//33 - 100001
//a. 34 - 100010 | 38^4 /
//b. 38 - 100110 | 39^1 / 34|4
//c. 39 - 100111 | 38^1 / 60^27 / 34|5 / 38|1
//d. 60 - 111100 | 62^2 / 27^39
//e. 62 - 111110 | 34|60 / 34|28
//63 - 111111

// 100x0x /35
// c^1 = b
// b^1 = c
// a|5 = c
// var f1 = (x) => ((x & 2) >> 1) & ((x & 5) >> 1)
var f1 = (x) => x ^ (x | 2) //34,35,38,39
var greaterThanEqual32 = (x) => x >>> 5
var lowerThanEqual63 = (x) => (x >>> 6) ^ 1
// [32, 64)
var from32to64 = (x) => (x >>> 5) & ((x >>> 6) ^ 1)
// var l2 = (x) => ((x & 6) >>> 1) & 3 & 1
var equal38_39 = (x) => (x >>> 2) & 1 & ((x & 2) >>> 1)
var equal34_38 = (x) => (x >>> 1) & 1 & ~(x & 1)
var equal34_38_39 = (x) =>
  ((x >>> 1) & 1 & ~(x & 1)) | ((x >>> 2) & 1 & ((x & 2) >>> 1))
var from32to64equal34_38_39 = (x) =>
  (x >>> 5) &
  ((x >>> 6) ^ 1) &
  (((x >>> 1) & 1 & ~(x & 1)) | ((x >>> 2) & 1 & ((x & 2) >>> 1)))
// var from32to40from56to64 = (x) => (((x >> 3) & 2) >> 1) === ((x >> 3) & 1)
var from32to40from56to64 = (x) => ((x >> 3) ^ 3) ^ ((x >> 3) & 4)
//(x&2)>>1
//(x&5)>>1
// +------+------+------+------+ +----------+----------+
// |  32  |  40  |  48  |  56  | |  100000  |  111000  |
// |  33  |  41  |  49  |  57  | |  100001  |  111001  |
// | [34] |  42  |  50  |  58  | | [100010] |  111010  |
// |  35  |  43  |  51  |  59  | |  100011  |  111011  |
// |  36  |  44  |  52  | [60] | |  100100  | [111100] |
// |  37  |  45  |  53  |  61  | |  100101  |  111101  |
// | [38] |  46  |  54  | [62] | | [100110] |  111110  |
// | [39] |  47  |  55  |  63  | | [100111] | [111111] |
// +------+------+------+------+ +----------+----------+

//? a|d = e
// a|28 = e
//? (a|5)^27 = d
// e^2 = d
//? c^27 = d
//? a|5 = c
// d^27 = c
//? b^1 = c
//? b|1 = c
//? a|4 = b
// c^1 = b
// b^4 = a

// ((((x|28)^2)^27)^1)^4 = x
var t34 = (x) => ((x | 28) ^ 2 ^ 27 ^ 1 ^ 4) === x

// ((((a|d)^2)^27)^1)^4 = a
// ((((a|((a|5)^27))^2)^27)^1)^4 = a
// var t = (x) => ((x | ((34 | 5) ^ 27)) ^ 2 ^ 27 ^ 1 ^ 4) === x
var t = (x) => ((x | 60) ^ 2 ^ 27 ^ 1 ^ 4) === x //32

// Reversed
//34 - 011101
//38 - 011001
//39 - 011000
//60 - 000011
//62 - 000001

var entityRegExp = /["&'<>]/
var enc = new TextEncoder()

function escapeHtml2(source) {
  var str = String(source)
  var match = entityRegExp.exec(str)

  if (!match) {
    return str
  }

  // var stream = enc.encode(str.slice(match.index))
  var index = match.index
  var escape
  var html = ''
  var lastIndex = 0
  var charCode

  for (; index < str.length; ++index) {
    // for (index = 0; index < stream.length; ++index) {
    // for (charCode of stream) {

    charCode = str.charCodeAt(index)
    // charCode = stream[index]

    if (
      (charCode >>> 5) &
      ((charCode >>> 6) ^ 1) &
      (((charCode >>> 1) & 1 & ~(charCode & 1)) |
        ((charCode >>> 2) & 1 & ((charCode & 2) >>> 1)))
    ) {
      // continue

      escape =
        charCode > 34
          ? charCode > 40
            ? charCode === 38
              ? '&amp;'
              : '&#39;'
            : charCode === 60
            ? '&lt;'
            : '&gt;'
          : '&quot;'
      // escape = BASE_ENTITY_ENCODING_MAP[charCode]

      // if (escape) {
      if (lastIndex !== index) {
        html += str.substring(lastIndex, index)
      }

      // html += BASE_ENTITY_ENCODING_MAP[charCode]
      html += escape
      // html += '&#' + charCode + ';'
      lastIndex = index + 1
      // }
    }

    // if (escape) {
    //   html += str.substring(lastIndex, index) + escape
    //   lastIndex = index + 1
    // }
  }

  return html
}

var matchHtmlRegExp = /["'&<>]/

function escapeHtml3(string) {
  var str = String(string)
  var match = matchHtmlRegExp.exec(str)

  if (!match) {
    return str
  }

  var escape
  var html = ''
  var index = 0
  var lastIndex = 0

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;'
        break
      case 38: // &
        escape = '&amp;'
        break
      case 39: // '
        escape = '&#39;'
        break
      case 60: // <
        escape = '&lt;'
        break
      case 62: // >
        escape = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escape
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}
