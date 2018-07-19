<template>
    <div :class="$options.name">
        <img v-if="src" :src="src" :alt="alt">
        <p v-else-if="Array.isArray(currentAlt) && currentAlt.length > 1"
           :class="{[dimClass]: currentAlt[0].length > 2}"
        >{{ currentAlt[0] }}<span :class="{[dimClass]: currentAlt[1].length > 2}">{{ currentAlt[1] }}</span></p>
        <p v-else>{{ currentAlt }}</p>
    </div>
</template>

<script>
export default {
  name: 'Avatar',

  props: {
    src: {
      type: String,
      default: '',
    },

    alt: {
      type: String,
      required: true,
    },

    maxAlt: {
      type: Number,
      default: 5,
      validator: v => Number.isInteger(v) && v > 0,
    },

    dimClass: {
      type: String,
      default: 'dim',
    },

    joinChar: {
      type: String,
      default: '',
    },
  },

  computed: {
    currentAlt() {
      return this.maxAlt < 4
        ? this.alt
            .split(/[.,:;&\-\\/\s]+/, this.maxAlt)
            .map(v => v[0])
            .join(this.joinChar)
        : this.alt
            .split(/[.,:;&\-\\/\s]+/, 2)
            .map((v, i) =>
              v.substring(
                0,
                i ? Math.ceil(this.maxAlt / 2) : Math.floor(this.maxAlt / 2)
              )
            )
    },
  },
}
</script>

<style lang="postcss" scoped>
.VueAvatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  border-radius: 50%;
  width: 50px;
  height: 50px;
  background: #2988d9;

  & > img {
    object-fit: cover;
    width: 100%;
  }

  & > p {
    font-size: 1.6rem;
    font-weight: bold;
    line-height: 1;
    text-indent: 0;
    text-align: center;
    text-transform: uppercase;
    color: white;

    &.dim,
    & > .dim {
      font-size: 1rem;
    }

    & > span {
      display: block;
    }
  }
}
</style>
