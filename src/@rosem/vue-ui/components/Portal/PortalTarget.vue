<script>
export default {
  functional: true,



  props: {
    name: {
      type: String,
      required: true,
    }
  },

  render(createElement, { children }) {
    console.log(children)
    return children;
  }
}
</script>
