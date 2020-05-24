<template>
  <div>
    <code>
      X: {{shiftX}}
      Y: {{shiftY}}
    </code>

    <div class="area" :class="{ area_limited: limitExceeded }">
      <Touch @onMove="handleMove" @onEnd="handleEnd">
        <div
          class="area__shape"
          v-bind:style="shapePositionStyle"
          ref="touch"
        ></div>
      </Touch>
    </div>
  </div>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";
import { reactive, computed, onMounted, ref } from "@vue/composition-api";

import Touch from "@/components/Touch/Touch.vue";

export default {
  components: {
    Touch,
  },

  methods: {
    handleMove(gesture) {
      let shiftX = this.startX + gesture.shiftX;
      let shiftY = this.startY + gesture.shiftY;

      this.shiftX =
        shiftX > this.limitX
          ? this.limitX
          : shiftX < -this.limitX
          ? -this.limitX
          : shiftX;
      this.shiftY =
        shiftY > this.limitY
          ? this.limitY
          : shiftY < -this.limitY
          ? -this.limitY
          : shiftY;
    },

    handleEnd(gesture) {
      if (gesture.shiftX) this.startX += gesture.shiftX;
      if (gesture.shiftY) this.startY += gesture.shiftY;
    },
  },

  data() {
    return {
      shiftX: 0,
      shiftY: 0,
    };
  },

  computed: {
    limitExceeded() {
      const { shiftX, shiftY } = this;
      return Math.abs(shiftX) >= this.limitX || Math.abs(shiftY) >= this.limitY;
    },

    shapePositionStyle() {
      return {
        transform: `translate(${this.shiftX}px, ${this.shiftY}px)`,
      };
    },
  },

  created() {
    this.startX = 0;
    this.startY = 0;
  },

  mounted() {
    this.limitX = this.$refs.touch.offsetLeft;
    this.limitY = this.$refs.touch.offsetTop;
  },
};
</script>

<style>
.area {
  background: #000;
  height: 200px;
  border: 8px solid gray;
  position: relative;
}

.area_limited {
  border-color: red;
}

.area__shape {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -20px;
  margin-top: -20px;
}
</style>
