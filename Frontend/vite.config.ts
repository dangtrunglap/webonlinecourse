import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { discoverDynamicRoutes } from './src/prerenderRoutes'

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: resolve(__dirname, 'src/prerender.tsx'),
      additionalPrerenderRoutes: [
        '/',
        '/blog',
        '/tools',
        '/about',
        '/contact',
        '/faq',
        '/policies',
        ...(await discoverDynamicRoutes()),
      ],
    }),
  ],
}))
