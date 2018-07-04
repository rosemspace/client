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
        this.$set(this.wormholes, name, {payload})
        console.log(this.wormholes[name]);
        // this.wormholes[name] = {payload, needsRefresh: false};
      }
    },

    close(name) {
      this.$delete(this.wormholes, name)
    },
  },
})

export default new Wormhole()
