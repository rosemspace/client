<template>
  <button
    :class="$style.button"
    v-on="$listeners"
  >
    <slot/>
  </button>
</template>

<style lang="postcss" module>
@import '~\@rosem/design';

.button {
  /* @extend %typography-small; */
  justify-self: center;
  min-width: 160px;
  padding: var(--size-button-padding);
  font-size: 14px;
  font-weight: 300;
  line-height: 2rem;
  color: var(--color-button-text);
  text-transform: uppercase;
  cursor: pointer;
  background: var(--color-button-bg);

  /* background: #7fc2e8; */

  /* background: #6b9fbd; */
  background: #4c8fb5;
  border: none;
  border-radius: 3px;

  /* border-bottom: solid 2px #698da2; */
  transition: box-shadow .2s;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px #4c8fb5
  }

  &:disabled {
    cursor: not-allowed;

    /* background: $color-button-disabled-bg; */
    background: #80b8da;
  }
}
</style>
