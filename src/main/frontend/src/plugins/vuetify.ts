// Styles
import 'vuetify/styles';

// Vuetify
import { createVuetify, ThemeDefinition } from 'vuetify';

const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#051E3A',
    secondary: '#0490E4',
    accent: '#025180',
    error: '#f44336',
    warning: '#ffc107',
    info: '#0490E4',
    success: '#009688',
    background: '#ECEFF1',
    surface: '#ECEFF1',
  },
};

export default createVuetify({
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    },
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
