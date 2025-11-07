import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      federation({
        name: 'registration',
        filename: 'remoteEntry.js',
        exposes: {
          './RegistrationApp': './src/App.jsx', // expose the entire app
        },
        shared: ['react', 'react-dom', 'react-router-dom'],
      }),

      // HMR: notify host to reload when registration rebuilds
      {
        name: 'vite-plugin-notify-host-on-rebuild',
        apply(config, { command }) {
          return Boolean(command === 'build' && config.build?.watch)
        },
        async buildEnd(error) {
          if (!error) {
            try {
              await fetch(`${env.VITE_HOST_URL}/__fullReload`)
            } catch (e) {
              console.log('Host reload notification failed:', e)
            }
          }
        },
      },
    ],

    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },

    // server: {
    //   port: 3001
    // }
  }
})
