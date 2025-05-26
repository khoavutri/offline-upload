// vite.config.ts
import { defineConfig } from "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/node_modules/vite/dist/node/index.js";
import { extname, relative, resolve } from "path";
import { fileURLToPath } from "node:url";
import { glob } from "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/node_modules/glob/dist/esm/index.js";
import react from "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/node_modules/vite-plugin-dts/dist/index.mjs";
import { libInjectCss } from "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/node_modules/vite-plugin-lib-inject-css/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\yywm1\\OneDrive\\Desktop\\code\\upload-image";
var __vite_injected_original_import_meta_url = "file:///C:/Users/yywm1/OneDrive/Desktop/code/upload-image/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({ include: ["lib"] })
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "lib/main.ts"),
      formats: ["es"]
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      input: Object.fromEntries(
        // https://rollupjs.org/configuration-options/#input
        glob.sync("lib/**/*.{ts,tsx}", {
          ignore: ["lib/**/*.d.ts"]
        }).map((file) => [
          // 1. The name of the entry point
          // lib/nested/foo.js becomes nested/foo
          relative(
            "lib",
            file.slice(0, file.length - extname(file).length)
          ),
          // 2. The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, __vite_injected_original_import_meta_url))
        ])
      ),
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5eXdtMVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGNvZGVcXFxcdXBsb2FkLWltYWdlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5eXdtMVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGNvZGVcXFxcdXBsb2FkLWltYWdlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy95eXdtMS9PbmVEcml2ZS9EZXNrdG9wL2NvZGUvdXBsb2FkLWltYWdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHsgZXh0bmFtZSwgcmVsYXRpdmUsIHJlc29sdmUgfSBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJ1xyXG5pbXBvcnQgeyBsaWJJbmplY3RDc3MgfSBmcm9tICd2aXRlLXBsdWdpbi1saWItaW5qZWN0LWNzcydcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGxpYkluamVjdENzcygpLFxyXG4gICAgZHRzKHsgaW5jbHVkZTogWydsaWInXSB9KVxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxyXG4gICAgbGliOiB7XHJcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ2xpYi9tYWluLnRzJyksXHJcbiAgICAgIGZvcm1hdHM6IFsnZXMnXVxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QvanN4LXJ1bnRpbWUnXSxcclxuICAgICAgaW5wdXQ6IE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICAvLyBodHRwczovL3JvbGx1cGpzLm9yZy9jb25maWd1cmF0aW9uLW9wdGlvbnMvI2lucHV0XHJcbiAgICAgICAgZ2xvYi5zeW5jKCdsaWIvKiovKi57dHMsdHN4fScsIHtcclxuICAgICAgICAgIGlnbm9yZTogW1wibGliLyoqLyouZC50c1wiXSxcclxuICAgICAgICB9KS5tYXAoZmlsZSA9PiBbXHJcbiAgICAgICAgICAvLyAxLiBUaGUgbmFtZSBvZiB0aGUgZW50cnkgcG9pbnRcclxuICAgICAgICAgIC8vIGxpYi9uZXN0ZWQvZm9vLmpzIGJlY29tZXMgbmVzdGVkL2Zvb1xyXG4gICAgICAgICAgcmVsYXRpdmUoXHJcbiAgICAgICAgICAgICdsaWInLFxyXG4gICAgICAgICAgICBmaWxlLnNsaWNlKDAsIGZpbGUubGVuZ3RoIC0gZXh0bmFtZShmaWxlKS5sZW5ndGgpXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgLy8gMi4gVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGVudHJ5IGZpbGVcclxuICAgICAgICAgIC8vIGxpYi9uZXN0ZWQvZm9vLnRzIGJlY29tZXMgL3Byb2plY3QvbGliL25lc3RlZC9mb28udHNcclxuICAgICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTChmaWxlLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICksXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXVtleHRuYW1lXScsXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVYsU0FBUyxvQkFBb0I7QUFDaFgsU0FBUyxTQUFTLFVBQVUsZUFBZTtBQUMzQyxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLFlBQVk7QUFDckIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixTQUFTLG9CQUFvQjtBQU43QixJQUFNLG1DQUFtQztBQUE4SyxJQUFNLDJDQUEyQztBQVN4USxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxJQUNmLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDdkMsU0FBUyxDQUFDLElBQUk7QUFBQSxJQUNoQjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsbUJBQW1CO0FBQUEsTUFDdkMsT0FBTyxPQUFPO0FBQUE7QUFBQSxRQUVaLEtBQUssS0FBSyxxQkFBcUI7QUFBQSxVQUM3QixRQUFRLENBQUMsZUFBZTtBQUFBLFFBQzFCLENBQUMsRUFBRSxJQUFJLFVBQVE7QUFBQTtBQUFBO0FBQUEsVUFHYjtBQUFBLFlBQ0U7QUFBQSxZQUNBLEtBQUssTUFBTSxHQUFHLEtBQUssU0FBUyxRQUFRLElBQUksRUFBRSxNQUFNO0FBQUEsVUFDbEQ7QUFBQTtBQUFBO0FBQUEsVUFHQSxjQUFjLElBQUksSUFBSSxNQUFNLHdDQUFlLENBQUM7QUFBQSxRQUM5QyxDQUFDO0FBQUEsTUFDSDtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
