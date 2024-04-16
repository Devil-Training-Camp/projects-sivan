import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // 自定义生成类名，name 表示当前文件夹名，local 表示类名
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
});
