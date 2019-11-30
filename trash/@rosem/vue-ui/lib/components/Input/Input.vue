<template>
  <div :class="[$style.input, 'RosemInput']">
    <input
      :id="$_uid"
      :type="type"
      :placeholder="finalPlaceholder"
      :value="value"
      v-bind="$attrs"
      v-on="$listeners"
      @input="value = $event.target.value"
    />
    <label v-if="label" :for="$_uid" :data-placeholder="finalPlaceholder">{{
      label
    }}</label>
  </div>
</template>

<script>
export default {
  name: 'RosemInput',

  inheritAttrs: false,

  props: {
    name: {
      type: String,
      default: '',
    },
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
    }
  },

  computed: {
    finalPlaceholder() {
      return this.placeholder ? this.placeholder : this.label
    },
  },

  created() {
    this.$_uid = this.name || this.$_rosem_uuid.generate()
  },
}
</script>

<style lang="postcss" module>
@-webkit-keyframes RosemInputAutofill {
  to {
    color: var(--autofill-color, inherit);
    background: var(--autofill-background-color, inherit);
  }
}

.input {
  --input-height: 32px;
  /*--autofill-background-color: #ffc7bd;*/

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

    &,
    &::placeholder,
    & + label {
      font: inherit;
    }

    &:focus {
      outline: none;
    }

    &:-webkit-autofill {
      -webkit-animation-name: RosemInputAutofill;
      -webkit-animation-fill-mode: both;
      /*-webkit-text-fill-color: inherit;*/
      border-radius: inherit;
    }

    &::placeholder {
      line-height: var(--input-height) !important;
    }
  }

  & > label {
    cursor: pointer;
    display: flex;
    align-items: center;
    line-height: 1;
    min-height: var(--input-height);
    padding: 0 10px;
  }
}
</style>

<style lang="postcss" scoped>
.RosemInput {
  --placeholder-speed: 0.2s;
  font-size: 16px;
  font-weight: 300;
  /*max-width: 300px;*/
  margin: 2.6rem 2rem;
  /*margin-right: auto;*/
  /*margin-left: auto;*/
  color: #666;
  background-color: white;
  border: solid 1px #eee;
  border-radius: 3px;
  transition: box-shadow var(--placeholder-speed);

  &:focus-within {
    box-shadow: 0 0 0 2px #ecf1f3;

    &::before {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0.5%;
      display: block;
      width: 99%;
      height: 0;
      /*border-bottom: solid 1px #6cc1e6;*/
    }
  }

  & > input::placeholder,
  & > label {
    color: var(--placeholder-color, #ccc);
  }

  & > input:not(:placeholder-shown) {
    & + label {
      font-size: 12px;
      font-weight: 600;
      pointer-events: auto;
      transform: translate(-9px, -90%);
      --placeholder-color: #73b5d8;
    }
  }

  & > input {
    position: relative;
    z-index: 1;

    &::placeholder {
      opacity: 0;
    }
  }

  & > label {
    position: absolute;
    pointer-events: none;
    transition: font-size var(--placeholder-speed),
      font-weight var(--placeholder-speed), color var(--placeholder-speed),
      transform var(--placeholder-speed);
  }
}
</style>
