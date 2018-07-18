<template>
  <div :id="`pop-${name}`">
    <slot :open="open" />
  </div>
</template>

<script>
const defaultCloseBy = {
  control: true,
  escape: true,
  outside: true,
  self: true
};

export default {
  name: 'Popover',

  //        render(h) {
  //            return h(this.tag, {
  //                attrs: {
  //                    id: `popup-${this.name}`,
  //                    class: this.$options.name,
  //                },
  //            }, [
  //                this.$scopedSlots.default({
  //                    open: this.open,
  //                })
  //            ]);
  //        },

  props: {
    tag: {
      type: String,
      default: 'div'
    },

    name: {
      type: String,
      required: true
    },

    closeBy: {
      type: Object,
      default: defaultCloseBy,
    }
  },

  data() {
    return {
      open: false
    };
  },

  computed: {
    finalCloseBy() {
      return Object.assign({}, defaultCloseBy, this.closeBy)
    }
  },

  beforeCreate() {
    this.$_rosem_popper.init(this.$root);
  },

  mounted() {
    this.$nextTick(() => {
      this.$_rosem_popper.add(this.name, {
        popperElement: this.$el,
        closeOnControlClick: true,
        closeOnSelfClick: true,
        closeOnClickOutside: true,
        closeOnPressEscape: true
      });
      this.$_rosem_popper.onOpen(this.name, () => (this.open = true));
      this.$_rosem_popper.onClose(this.name, () => (this.open = false));
    });
  },

  destroyed() {
    this.$_rosem_popper.remove(this.name);
  }
};
</script>

<style lang="postcss">
.RosemPop {
  margin: 1rem;

  & [x-arrow] {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    color: white;
  }
}

.RosemPop[x-placement^="top"] {
  & [x-arrow] {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
}

.RosemPop[x-placement^="right"] {
  & [x-arrow] {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent;
    border-top-color: transparent;
    border-bottom-color: transparent;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
}

.RosemPop[x-placement^="bottom"] {
  & [x-arrow] {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: transparent;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
}

.RosemPop[x-placement^="left"] {
  & [x-arrow] {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
