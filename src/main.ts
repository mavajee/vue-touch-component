import Vue from "vue";
import VueCompositionApi from "@vue/composition-api";
import { Component } from "vue-property-decorator";

import App from "./App.vue";

Vue.config.productionTip = false;
Vue.use(VueCompositionApi);
// Setup custom methods for vue
Component.registerHooks(["setup"]);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
