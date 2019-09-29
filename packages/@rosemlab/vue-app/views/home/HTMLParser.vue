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
import isObject from 'lodash/isObject'
import { Vue, Component } from 'vue-property-decorator'
import { qualifiedNameRegExp } from '@rosemlab/xml-syntax'
import HTMLParser from '@rosemlab/html-parser'
import TemplateCompiler from '@rosemlab/template-compiler/TemplateCompiler'
import { VDOMRenderer } from '@rosemlab/virtual-dom'
import WebRenderer from '@rosemlab/web-ui/WebRenderer'

const htmlParser = new HTMLParser({
  rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
})
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
