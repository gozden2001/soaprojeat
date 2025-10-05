import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#D4730A',     // Warm orange
          secondary: '#F59E0B',   // Warm amber
          accent: '#F97316',      // Warm accent
          error: '#DC2626',       // Warm red
          info: '#0EA5E9',        // Sky blue
          success: '#059669',     // Emerald
          warning: '#D97706',     // Amber
          background: '#FFFBF5',  // Warm background
          surface: '#FEF7ED',     // Warm surface
        }
      }
    }
  }
})