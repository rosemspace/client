<template>
  <div class="htmlParser">
    <h2>HTML Parser</h2>
    <label for="markup">Markup</label>
    <div class="row">
      <textarea
        name="markup"
        id="markup"
        cols="30"
        rows="10"
        @input="onInput"
      ></textarea>
      <pre class="explorer" ref="explorer">{{
        compiledResult | removeCircular
      }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import HTMLParser, {
  HTMLParserOptions,
} from '@rosemlabs/html-parser-old/HTMLParser'
import { qualifiedNameRegExp } from '@rosemlabs/html-parser/utils/xml'
import TemplateCompiler from '@rosemlabs/template-compiler/TemplateCompiler'
import { VDOMRenderer } from '@rosemlabs/virtual-dom'
import isObject from 'lodash/isObject'
import { Component, Vue } from 'vue-property-decorator'

const htmlParser = new HTMLParser({
  rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
} as HTMLParserOptions)
const templateCompiler = new TemplateCompiler(new VDOMRenderer())

htmlParser.addModule(templateCompiler)

@Component({
  filters: {
    removeCircular: function(value: string) {
      return JSON.stringify(
        value,
        (key: string, value: any): any => {
          if (isObject(value)) {
            //@ts-ignore
            delete value.parent
            //@ts-ignore
            delete value.nextSibling
            //@ts-ignore
            delete value.ownerElement
          }

          return value
        },
        2
      )
    },
  },
})
export default class HTMLParserExplorer extends Vue {
  private compiledResult: object = templateCompiler.getCompiledResult()

  onInput(event: Event): void {
    htmlParser.parseFromString((event.target as HTMLTextAreaElement).value)
    debugger
    this.compiledResult = templateCompiler.getCompiledResult()
    // this.$refs.explorer.innerHTML = ''
    // this.$refs.explorer.appendChild(this.compiledResult)
  }
}
</script>
