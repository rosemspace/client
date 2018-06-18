<template>
  <div :class="[$style.input, 'RosemInput', {focused, notEmpty: value}]">
    <input
      :id="$_rosem_uuid.getLast()"
      :type="type"
      :placeholder="finalPlaceholder"
      :value="value"
      v-bind="$attrs"
      v-on="$listeners"
      @focus="focused = true"
      @blur="focused = false"
      @input="value = $event.target.value"
    >
    <label
      v-if="label"
      :for="$_rosem_uuid.getLast()"
    >{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'RosemInput',

  inheritAttrs: false,

  props: {
    type: {
      type: String,
      default: 'text',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      value: '',
      focused: false,
    }
  },

  computed: {
    finalPlaceholder() {
      return this.placeholder ? this.placeholder : this.label
    },
  },

  created() {
    this.$_rosem_uuid.generate()
  },
}
</script>

<style lang="postcss" module>
.input {
  --input-height: 32px;

  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: solid 1px silver;

  & > input {
    order: 1;
    width: 100%;
    height: var(--input-height);
    padding: 0 10px;
    color: inherit;
    background: none;
    border: none;

    &:focus {
      outline: none;
    }

    &:-webkit-autofill {
      color: inherit;
    }

    &,
    &::placeholder,
    & + label {
      font-family: inherit;
      font-size: var(--font-size, 14px);
      font-weight: var(--font-weight, 500);
      line-height: 1;
    }
  }

  & > label {
    display: flex;
    align-items: center;
    min-height: var(--input-height);
    padding: 0 10px;
  }
}
</style>

<style lang="postcss">
.RosemInput {
  --placeholder-speed: 0.2s;
  max-width: 300px;
  margin-top: 26px;
  margin-right: auto;
  margin-left: auto;
  color: #666;
  border: solid 1px #ddd;
  border-radius: 3px;

  &.focused {
    box-shadow: 0 0 0 2px #eee;

    &::before {
      position: absolute;
      bottom: -1px;
      left: 1%;
      display: block;
      width: 98%;
      height: 0;
      content: '';
      /*border-bottom: solid 1px #6cc1e6;*/
    }
  }

  & > input::placeholder,
  & > label {
    color: var(--placeholder-color, #ccc);
  }

  /*&.placeholderAsLabel {*/
  &.notEmpty {
    & > input {
      &::placeholder {
        opacity: 0;
        transition: opacity 0s;
      }
    }

    & > label {
      font-size: 12px;
      pointer-events: auto;
      opacity: 1;
      transition: font-size var(--placeholder-speed),
      color var(--placeholder-speed), transform var(--placeholder-speed);
      transform: translate(-9px, -90%);
      --placeholder-color: #73b5d8;
    }
  }

  & > input {
    position: relative;
    z-index: 1;

    &::placeholder {
      opacity: 1;
      transition: opacity 0s var(--placeholder-speed);
    }
  }

  & > label {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    transition: font-size var(--placeholder-speed),
      opacity 0s var(--placeholder-speed), color var(--placeholder-speed),
      transform var(--placeholder-speed);
  }

  /*}*/
}
</style>
