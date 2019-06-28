<template>
  <div class="home">
    <Greeting />
    <HTMLParser />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Greeting from './home/Greeting.vue'
import HTMLParser from './home/HTMLParser.vue'

@Component({
  components: {
    Greeting,
    HTMLParser,
  },
})
export default class Home extends Vue {}
</script>
