<script>
import Vue from 'vue';
import Target from './PortalTarget'
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
    console.log(context);
    // const newTarget = new Vue({
    //   ...Target,
    //   parent: context.parent,
    //   children: context.children,
    //   propsData: {
    //     name: context.props.to,
    //     // tag: el.tagName,
    //     // attributes: extractAttributes(el),
    //   },
    // })

    let PortalTarget = Vue.extend({
      name: 'RosemPortalTarget',
      functional: true,
      props: {
        name: {
          type: String,
          required: true,
        }
      },
      render(createElement, context) {
        return context.children;
      }
    });
    const newTarget = new PortalTarget({
      parent: context.parent,
      // children: context.children,
      propsData: {
        name: context.props.to,
        // tag: el.tagName,
        // attributes: extractAttributes(el),
      },
    })
    newTarget.$children = context.children;

    // const newTarget = createElement('RosemPortalTarget', {
    //   props: {
    //     name: context.props.to,
    //     // tag: el.tagName,
    //     // attributes: extractAttributes(el),
    //   },
    // })
    console.log(newTarget);
    // console.log(newTarget.$mount(document.getElementById('test')))

    return [];
    // return context.children
    // return this.$slots.default[0]
  },
}
</script>
