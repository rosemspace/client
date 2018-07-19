import Vue from 'vue'

export const Wormhole = Vue.extend({
  data() {
    return {
      wormholes: {},
    }
  },

  methods: {
    open(name, payload) {
      if (!this.wormholes[name]) {
        this.$set(this.wormholes, name, payload)
        // this.wormholes[name] = payload;
        this.$emit('open', payload)
      }
    },

    close(name) {
      this.$delete(this.wormholes, name)
    },
  },
})

export default new Wormhole()
