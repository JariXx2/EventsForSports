import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Импортируйте стили Vuetify
import { VTimePicker } from 'vuetify/labs/components';
export default createVuetify({
  components:{
    VTimePicker,
  },
  theme: {
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
