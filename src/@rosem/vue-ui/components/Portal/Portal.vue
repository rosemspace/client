<script>
import WM from './WormholeManager'
// import Vue from 'vue';
// import Target from './PortalTarget'
// import extractAttributes from './extractAttributes'

export default {
  functional: true,

  props: {
    to: {
      type: String,
      required: true,
    },
  },

  render(createElement, context) {
    console.log('Portal')
    WM.open(context.props.to, context.children)

    return context.children;
    // return [...context.children];
    // return WormholeManager.wormholes[context.props.to].payload;
  },
}
</script>
