/** La Bella Lupita · identidad V3 · colores, radios y tipografía compartidos */
export default {
  content: ['./index.html', './src/casa/**/*.{ts,tsx}'],
  theme: {
    
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      
      avena: '#FBF6EE',
      
      papel: '#FBF6EE',
      
      filete: '#D7C1A5',
      
      tinta: '#53291E',
      
      'tinta-media': '#76574B',
      
      banda: '#53291E',
      
      'banda-honda': '#53291E',
      
      'banda-velo': '#F7E6E0',
      
      achiote: '#942F32',
      
      'achiote-velo': '#F7E6E0',
      
      contorno: '#957569',
      
      rosa: '#F9AFA4',
      exito: '#32634C',
      foco: '#B60032',
      // Dirección aprobada en Inicio y extendida al sistema de la aplicación.
      'inicio-crema': '#FFFDF9',
      'inicio-rosa': '#F9E7E2',
      'inicio-borgona': '#B60032',
    },

    borderRadius: {
      carnet: '4px',
      editorial: '4px',
      
      none: '0px',
      
      troquel: '4px',
      
      hoja: '4px',
      
      full: '9999px',
      'inicio-tarjeta': '24px',
      'inicio-control': '16px',
    },

    fontSize: {
      
      micro: ['.75rem', { lineHeight: '1.2' }],
      
      menuda: ['.75rem', { lineHeight: '1.45' }],
      
      pie: ['.75rem', { lineHeight: '1.5' }],
      
      cuerpo: ['1rem', { lineHeight: '1.6' }],
      
      guia: ['1rem', { lineHeight: '1.35' }],
      
      seccion: ['1.3125rem', { lineHeight: '1.2' }],
      
      pantalla: ['1.625rem', { lineHeight: '1.12' }],
      
      grande: ['2.5rem', { lineHeight: '1' }],
    },

    extend: {
      
      fontFamily: {
        titular: ['Playfair Display Inicio', 'Georgia', 'serif'],
        texto: ['Montserrat Inicio', 'system-ui', 'sans-serif'],
        'inicio-titular': ['Playfair Display Inicio', 'Georgia', 'serif'],
        'inicio-texto': ['Montserrat Inicio', 'system-ui', 'sans-serif'],
      },

      transitionTimingFunction: {
        extraccion: 'cubic-bezier(0.16, 0.84, 0.24, 1)',
        crema: 'cubic-bezier(0.32, 0.72, 0.18, 1)',
        caida: 'cubic-bezier(0.55, 0, 0.86, 0.3)',
        vapor: 'cubic-bezier(0.62, 0.02, 0.2, 1)',
        sello: 'cubic-bezier(0.34, 1.12, 0.44, 1)',
      },
      transitionDuration: {
        tactil: '120ms',
        ui: '200ms',
        panel: '320ms',
        rito: '520ms',
        troquel: '840ms',
      },
    },
  },
  plugins: [],
}
