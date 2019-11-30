<script>
import WM from './WormholeManager'

export default {
  functional: true,

  props: {
    name: {
      type: String,
      required: true,
    },
  },

  render(createElement, context) {
    console.log('PortalTarget')

    const wormhole = WM.wormholes[context.props.name]

    if (wormhole) {
      return wormhole
    }

    WM.$once('open', function(event) {
      // WM.$set(WM.wormholes, context.props.name, event);
      WM.wormholes[context.props.name] = event
      console.log('OPENED')
    })

    return context.children
  },
}
</script>
