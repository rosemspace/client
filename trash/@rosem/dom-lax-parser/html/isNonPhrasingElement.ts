// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content
// https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
export default function isNonPhrasingElement(tag: string): boolean {
  // <address>, <article>, <aside>, <base>, <blockquote>, <body>, <caption>,
  // <col>, <colgroup>, <dd>, <details>, <dialog>, <div>, <dl>, <dt>,
  // <fieldset>, <figcaption>, <figure>, <footer>, <form>, <h1>, <h2>, <h3>,
  // <h4>, <h5>, <h6>, <head>, <header>, <hgroup>, <hr>, <html>, <legend>,
  // <li>, <menuitem>, <meta>, <optgroup>, <option>, <param>, <rp>, <rt>,
  // <source>, <style>, <summary>, <tbody>, <td>, <tfoot>, <th>, <thead>,
  // <title>, <tr>, <track>
  return /^(a(?:ddress|rticle|side)|b(?:ase|lockquote)|col|(?:col|h|opt)group|d[dlt]|d(?:etails|ialog|iv)|f(?:ieldset|igure|o(?:oter|rm))|(?:fig)?caption|h(?:[1-6r]|ead(?:er)?|tml)|l(?:egend|i)|me(?:nuitem|ta)|option|param|r[pt]|s(?:ource|tyle|ummary)|t(?:[dhr]|head|foot|rack|itle)|t?body)$/i.test(
    tag
  )
}
