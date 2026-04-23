import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '',
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        bookmarks: resolve(__dirname, 'bookmarks.html'),
        notepad: resolve(__dirname, 'notepad.html'),
      },
    },
  },
});
