// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "file:///L:/scorpioncode/front/dashboard/node_modules/vite/dist/node/index.js";

// plugins.js
import vue from "file:///L:/scorpioncode/front/dashboard/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///L:/scorpioncode/front/dashboard/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///L:/scorpioncode/front/dashboard/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///L:/scorpioncode/front/dashboard/node_modules/unplugin-vue-components/dist/resolvers.js";
import Icons from "file:///L:/scorpioncode/front/dashboard/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///L:/scorpioncode/front/dashboard/node_modules/unplugin-icons/dist/resolver.js";
import { createSvgIconsPlugin } from "file:///L:/scorpioncode/front/dashboard/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "L:\\scorpioncode\\front\\dashboard";
var pathSrc = path.relative(__vite_injected_original_dirname, "src");
function getPlugins() {
  return [
    vue(),
    // svg组件
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]",
      svgoOptions: {
        // 删除填充的属性
        plugins: [
          {
            name: "removeAttrs",
            params: { attrs: ["class", "data-name", "fill", "stroke"] }
          }
        ]
      }
    }),
    //element plus 自动导入插件
    AutoImport({
      // 自动导入 Vue 和 Vue-router 相关函数，如 ref, reactive, createRouter 等
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          // prefix: 'i', 默认为i，所以可以不用声明
          enabledCollections: ["ep", "ant-design"]
          //指定图标集合，@iconify-json/ep 是 Element plus 的图标库
        })
      ],
      dts: path.resolve(pathSrc, "auto-imports.d.ts")
    }),
    // 开启Icons图标自动下载
    Icons({
      autoInstall: true
    })
  ];
}

// vite.config.js
var __vite_injected_original_import_meta_url = "file:///L:/scorpioncode/front/dashboard/vite.config.js";
var vite_config_default = defineConfig(({ mode }) => {
  let env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE_URL,
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    //配置代理
    server: {
      proxy: {
        [env.VITE_API]: {
          target: env.VITE_HOST,
          // 后端服务器地址
          changeOrigin: true,
          // 是否改变请求域名
          rewrite: (path2) => path2.replace(new RegExp(`^${env.VITE_API}`), "")
          //将原有请求路径中的api替换为''
        }
      }
    },
    // scss全局变量
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: '@import "./src/assets/style/global.scss";'
        }
      }
    },
    plugins: getPlugins()
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0w6L3Njb3JwaW9uY29kZS9mcm9udC9kYXNoYm9hcmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGdldFBsdWdpbnMgfSBmcm9tICcuL3BsdWdpbnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHttb2RlfSkgPT4ge1xyXG4gIC8vIFx1ODNCN1x1NTNENlx1NTQwNFx1NzlDRFx1NzNBRlx1NTg4M1x1NEUwQlx1NzY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1NTNEOFx1OTFDRlxyXG4gIGxldCBlbnYgPSBsb2FkRW52KG1vZGUscHJvY2Vzcy5jd2QoKSlcclxuICByZXR1cm4ge1xyXG4gICAgYmFzZTogZW52LlZJVEVfQkFTRV9VUkwsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vXHU5MTREXHU3RjZFXHU0RUUzXHU3NDA2XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICBbZW52LlZJVEVfQVBJXToge1xyXG4gICAgICAgICAgdGFyZ2V0OiBlbnYuVklURV9IT1NULCAvLyBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjhcdTU3MzBcdTU3NDBcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSwgLy8gXHU2NjJGXHU1NDI2XHU2NTM5XHU1M0Q4XHU4QkY3XHU2QzQyXHU1N0RGXHU1NDBEXHJcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke2Vudi5WSVRFX0FQSX1gKSwgJycpLy9cdTVDMDZcdTUzOUZcdTY3MDlcdThCRjdcdTZDNDJcdThERUZcdTVGODRcdTRFMkRcdTc2ODRhcGlcdTY2RkZcdTYzNjJcdTRFM0EnJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHNjc3NcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogJ0BpbXBvcnQgXCIuL3NyYy9hc3NldHMvc3R5bGUvZ2xvYmFsLnNjc3NcIjsnXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogZ2V0UGx1Z2lucygpXHJcblxyXG4gIH1cclxuXHJcbn0pIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJMOlxcXFxzY29ycGlvbmNvZGVcXFxcZnJvbnRcXFxcZGFzaGJvYXJkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJMOlxcXFxzY29ycGlvbmNvZGVcXFxcZnJvbnRcXFxcZGFzaGJvYXJkXFxcXHBsdWdpbnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0w6L3Njb3JwaW9uY29kZS9mcm9udC9kYXNoYm9hcmQvcGx1Z2lucy5qc1wiO2ltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xyXG5pbXBvcnQgSWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSdcclxuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuLy8gcGF0aFNyYyBcdTY2MkZcdTdFRDlcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTU2RkVcdTY4MDdcdTVFOTNcdTRGN0ZcdTc1MjhcdTc2ODRcclxuY29uc3QgcGF0aFNyYyA9IHBhdGgucmVsYXRpdmUoX19kaXJuYW1lLCdzcmMnKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdWdpbnMoKXtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgdnVlKCksXHJcbiAgICAgICAgLy8gc3ZnXHU3RUM0XHU0RUY2XHJcbiAgICAgICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xyXG4gICAgICAgICAgaWNvbkRpcnM6IFtwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hc3NldHMvaWNvbnMnKV0sXHJcbiAgICAgICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJyxcclxuICAgICAgICAgIHN2Z29PcHRpb25zOntcclxuICAgICAgICAgICAgLy8gXHU1MjIwXHU5NjY0XHU1ODZCXHU1MTQ1XHU3Njg0XHU1QzVFXHU2MDI3XHJcbiAgICAgICAgICAgIHBsdWdpbnM6W1xyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6J3JlbW92ZUF0dHJzJyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczp7YXR0cnM6W1wiY2xhc3NcIixcImRhdGEtbmFtZVwiLFwiZmlsbFwiLFwic3Ryb2tlXCJdfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIC8vZWxlbWVudCBwbHVzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxyXG4gICAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1IFZ1ZSBcdTU0OEMgVnVlLXJvdXRlciBcdTc2RjhcdTUxNzNcdTUxRkRcdTY1NzBcdUZGMENcdTU5ODIgcmVmLCByZWFjdGl2ZSwgY3JlYXRlUm91dGVyIFx1N0I0OVxyXG4gICAgICAgICAgaW1wb3J0czpbJ3Z1ZScsJ3Z1ZS1yb3V0ZXInXSxcclxuICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1IEVsZW1lbnQgUGx1cyBcdTc2RjhcdTUxNzNcdTUxRkRcdTY1NzBcdUZGMENcdTU5ODJcdUZGMUFFbE1lc3NhZ2UsIEVsTWVzc2FnZUJveC4uLiAoXHU1RTI2XHU2ODM3XHU1RjBGKVxyXG4gICAgICAgICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKCksXHJcbiAgICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTZGRVx1NjgwN1x1N0VDNFx1NEVGNlxyXG4gICAgICAgICAgICBJY29uc1Jlc29sdmVyKHtcclxuICAgICAgICAgICAgICAvLyBwcmVmaXg6ICdpJywgXHU5RUQ4XHU4QkE0XHU0RTNBaVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTNFRlx1NEVFNVx1NEUwRFx1NzUyOFx1NThGMFx1NjYwRVxyXG4gICAgICAgICAgICAgIGVuYWJsZWRDb2xsZWN0aW9uczpbJ2VwJywnYW50LWRlc2lnbiddIC8vXHU2MzA3XHU1QjlBXHU1NkZFXHU2ODA3XHU5NkM2XHU1NDA4XHVGRjBDQGljb25pZnktanNvbi9lcCBcdTY2MkYgRWxlbWVudCBwbHVzIFx1NzY4NFx1NTZGRVx1NjgwN1x1NUU5M1xyXG4gICAgXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBkdHM6IHBhdGgucmVzb2x2ZShwYXRoU3JjLCAnYXV0by1pbXBvcnRzLmQudHMnKSxcclxuICAgICAgICB9KSxcclxuICAgIFxyXG4gICAgICAgIC8vIFx1NUYwMFx1NTQyRkljb25zXHU1NkZFXHU2ODA3XHU4MUVBXHU1MkE4XHU0RTBCXHU4RjdEXHJcbiAgICAgICAgSWNvbnMoe1xyXG4gICAgICAgICAgYXV0b0luc3RhbGw6IHRydWUsXHJcbiAgICAgICAgfSksXHJcbiAgICBdXHJcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVSLFNBQVMsZUFBZSxXQUFXO0FBRTFULFNBQVMsY0FBYyxlQUFlOzs7QUNGeU8sT0FBTyxTQUFTO0FBQy9SLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLFVBQVU7QUFQakIsSUFBTSxtQ0FBbUM7QUFVekMsSUFBTSxVQUFVLEtBQUssU0FBUyxrQ0FBVSxLQUFLO0FBRXRDLFNBQVMsYUFBWTtBQUN4QixTQUFPO0FBQUEsSUFDSCxJQUFJO0FBQUE7QUFBQSxJQUVKLHFCQUFxQjtBQUFBLE1BQ25CLFVBQVUsQ0FBQyxLQUFLLFFBQVEsUUFBUSxJQUFJLEdBQUcsa0JBQWtCLENBQUM7QUFBQSxNQUMxRCxVQUFVO0FBQUEsTUFDVixhQUFZO0FBQUE7QUFBQSxRQUVWLFNBQVE7QUFBQSxVQUNOO0FBQUEsWUFDRSxNQUFLO0FBQUEsWUFDTCxRQUFPLEVBQUMsT0FBTSxDQUFDLFNBQVEsYUFBWSxRQUFPLFFBQVEsRUFBQztBQUFBLFVBQ3JEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBLElBRUQsV0FBVztBQUFBO0FBQUEsTUFFVCxTQUFRLENBQUMsT0FBTSxZQUFZO0FBQUEsTUFDM0IsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsSUFDbkMsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsV0FBVztBQUFBO0FBQUEsUUFFVCxvQkFBb0I7QUFBQTtBQUFBLFFBRXBCLGNBQWM7QUFBQTtBQUFBLFVBRVosb0JBQW1CLENBQUMsTUFBSyxZQUFZO0FBQUE7QUFBQSxRQUV6QyxDQUFDO0FBQUEsTUFDRDtBQUFBLE1BQ0EsS0FBSyxLQUFLLFFBQVEsU0FBUyxtQkFBbUI7QUFBQSxJQUNoRCxDQUFDO0FBQUE7QUFBQSxJQUdELE1BQU07QUFBQSxNQUNKLGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNMO0FBQ0o7OztBRHRENkssSUFBTSwyQ0FBMkM7QUFNOU4sSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBQyxLQUFJLE1BQU07QUFFdEMsTUFBSSxNQUFNLFFBQVEsTUFBSyxRQUFRLElBQUksQ0FBQztBQUNwQyxTQUFPO0FBQUEsSUFDTCxNQUFNLElBQUk7QUFBQSxJQUNWLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLENBQUMsSUFBSSxRQUFRLEdBQUc7QUFBQSxVQUNkLFFBQVEsSUFBSTtBQUFBO0FBQUEsVUFDWixjQUFjO0FBQUE7QUFBQSxVQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLElBQUksT0FBTyxJQUFJLElBQUksUUFBUSxFQUFFLEdBQUcsRUFBRTtBQUFBO0FBQUEsUUFDcEU7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixtQkFBbUI7QUFBQSxVQUNuQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLFdBQVc7QUFBQSxFQUV0QjtBQUVGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
