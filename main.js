import {createApp} from "vue";
import App from "./views/App.vue";
import router from "./router";
import "vuetify/styles";
import {createVuetify} from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import {ru, zhHans} from "vuetify/locale";

const vuetify = createVuetify({
    locale: {
      locale:"ru",
      fallback:"ru",
      messages:{zhHans,ru}
    },
    components,
    directives,
});

createApp(App).use(router).use(vuetify).mount("#app");
