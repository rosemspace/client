<template>
  <button
    :class="$style.button"
    v-on="$listeners"
  >
    <slot/>
  </button>
</template>

<style lang="scss" module>
@import '~\@rosem/design/index.scss';

.button {
  @extend %typography-small;
  font-size: 14px;
  line-height: 2rem;
  font-weight: 300;
  text-transform: uppercase;
  justify-self: center;
  min-width: 160px;
  border-radius: 3px;

  padding: $size-button-padding;
  color: $color-button-text;
  cursor: pointer;
  background: $color-button-bg;
  /*background: #7fc2e8;*/
  /*background: #6b9fbd;*/
  background: #4c8fb5;
  border: none;
  /*border-bottom: solid 2px #698da2;*/
  transition: box-shadow .2s;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px #4c8fb5
  }

  &:disabled {
    cursor: not-allowed;
    /*background: $color-button-disabled-bg;*/
    background: #80b8da;
  }
}
</style>
