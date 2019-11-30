<script>
export default {
  page() {
    return {
      title: this.user.name,
      meta: [
        {
          name: 'description',
          content: `The user profile for ${this.user.name}.`,
        },
      ],
    }
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <div class="view-profile">
    <h1>
      <BaseIcon name="user" />
      {{ user.name }}
      Profile
    </h1>
    <pre>{{ user }}</pre>
  </div>
</template>
