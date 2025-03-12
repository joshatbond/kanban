import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  react: {
    babel: {
      plugins: [
        'babel-plugin-react-compiler',
        {
          target: '19',
        },
      ],
    },
  },
  tsr: {
    appDirectory: 'src/app',
  },
  vite: {
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
})
