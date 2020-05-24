<template>
  <component v-bind:is="tag" ref="rootRef">
    <slot></slot>
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue, PropSync } from "vue-property-decorator";
import { ref, onMounted } from "@vue/composition-api";

import { TouchController } from "./TouchController";

@Component
export default class Touch extends Vue {
  private controller?: TouchController;

  @Prop({ default: "div" }) private tag!: string;

  mounted() {
    const el = this.$refs.rootRef as Node;
    this.controller = new TouchController(el, this.$listeners);
  }

  destroyed() {
    this.controller && this.controller.dispose();
  }
}
</script>
