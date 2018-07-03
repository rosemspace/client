<script>
// Allows stubbing Link in unit tests
const RosemLink = 'RosemLink'

export default {
  // Functional components are stateless, meaning they can't
  // have data, computed properties, etc and they have no
  // `this` context.
  functional: true,
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  // Render functions are an alternative to templates
  render(h, { props, $style = {} }) {
    function getRouteTitle(route) {
      return typeof route.title === 'function' ? route.title() : route.title
    }

    // Functional components are the only components allowed
    // to return an array of children, rather than a single
    // root node.
    return props.routes.map(route => (
      <RosemLink
        tag="li"
        key={route.name}
        to={route}
        exact-active-class={$style.active}
      >
        <a>{getRouteTitle(route)}</a>
      </RosemLink>
    ))
  },
}
</script>

<style lang="scss" module>
@import '~\@rosem/design/index.scss';

.active a {
  font-weight: 600;
  color: $color-link-text-active;
  text-decoration: none;
  cursor: default;
}
</style>
