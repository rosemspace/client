<script>
import WormholeManager from './WormholeManager'

export default {
  functional: true,

  props: {
    name: {
      type: String,
      required: true,
    }
  },

  render(createElement, context) {
    console.log('PortalTarget')
    const wormhole = WormholeManager.wormholes[context.props.name]

    if (wormhole) {
      wormhole.needsRefresh = true;

      return wormhole.payload
    }

    return [];
  }
}
</script>
