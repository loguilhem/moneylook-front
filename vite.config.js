import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/account-types': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/bank-accounts': 'http://localhost:8000',
      '/categories': 'http://localhost:8000',
      '/expenses': 'http://localhost:8000',
      '/incomes': 'http://localhost:8000',
      '/recurring-expenses': 'http://localhost:8000',
      '/recurring-incomes': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
    },
  },
})
