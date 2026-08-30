import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/* `base` is the repository name because this is published as a GitHub project
   page, which serves from /sakr-tagger/ rather than from the domain root. Left
   at the default '/', every asset URL in the built index.html points one level
   too high and the page loads as a blank screen with two 404s.
 *
   Only the production build needs it. `npm run dev` serves from the root, so
   the base is applied on build alone and the dev server is unaffected. */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sakr-tagger/' : '/',
  plugins: [vue()],
}))
