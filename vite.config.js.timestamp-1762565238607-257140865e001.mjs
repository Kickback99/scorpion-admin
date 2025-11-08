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
import prismjs from "file:///L:/scorpioncode/front/dashboard/node_modules/vite-plugin-prismjs/dist/index.js";
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
    prismjs({
      languages: ["json", "js", "java", "xml"]
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
    //t_env：base
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0w6L3Njb3JwaW9uY29kZS9mcm9udC9kYXNoYm9hcmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGdldFBsdWdpbnMgfSBmcm9tICcuL3BsdWdpbnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHttb2RlfSkgPT4ge1xyXG4gIC8vIFx1ODNCN1x1NTNENlx1NTQwNFx1NzlDRFx1NzNBRlx1NTg4M1x1NEUwQlx1NzY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1NTNEOFx1OTFDRlxyXG4gIGxldCBlbnYgPSBsb2FkRW52KG1vZGUscHJvY2Vzcy5jd2QoKSlcclxuICByZXR1cm4ge1xyXG4gICAgLy90X2Vudlx1RkYxQWJhc2VcclxuICAgIGJhc2U6IGVudi5WSVRFX0JBU0VfVVJMLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1x1OTE0RFx1N0Y2RVx1NEVFM1x1NzQwNlxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgW2Vudi5WSVRFX0FQSV06IHtcclxuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfSE9TVCwgLy8gXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1NjUzOVx1NTNEOFx1OEJGN1x1NkM0Mlx1NTdERlx1NTQwRFxyXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtlbnYuVklURV9BUEl9YCksICcnKS8vXHU1QzA2XHU1MzlGXHU2NzA5XHU4QkY3XHU2QzQyXHU4REVGXHU1Rjg0XHU0RTJEXHU3Njg0YXBpXHU2NkZGXHU2MzYyXHU0RTNBJydcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBzY3NzXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6ICdAaW1wb3J0IFwiLi9zcmMvYXNzZXRzL3N0eWxlL2dsb2JhbC5zY3NzXCI7J1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IGdldFBsdWdpbnMoKVxyXG5cclxuICB9XHJcblxyXG59KSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiTDpcXFxcc2NvcnBpb25jb2RlXFxcXGZyb250XFxcXGRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiTDpcXFxcc2NvcnBpb25jb2RlXFxcXGZyb250XFxcXGRhc2hib2FyZFxcXFxwbHVnaW5zLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9MOi9zY29ycGlvbmNvZGUvZnJvbnQvZGFzaGJvYXJkL3BsdWdpbnMuanNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gJ3VucGx1Z2luLWljb25zL3Jlc29sdmVyJ1xyXG5pbXBvcnQgeyBjcmVhdGVTdmdJY29uc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHByaXNtanMgZnJvbSAndml0ZS1wbHVnaW4tcHJpc21qcyc7XHJcblxyXG4vLyBwYXRoU3JjIFx1NjYyRlx1N0VEOVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTZGRVx1NjgwN1x1NUU5M1x1NEY3Rlx1NzUyOFx1NzY4NFxyXG5jb25zdCBwYXRoU3JjID0gcGF0aC5yZWxhdGl2ZShfX2Rpcm5hbWUsJ3NyYycpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2lucygpe1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICB2dWUoKSxcclxuICAgICAgICAvLyBzdmdcdTdFQzRcdTRFRjZcclxuICAgICAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcbiAgICAgICAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9pY29ucycpXSxcclxuICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgICAgc3Znb09wdGlvbnM6e1xyXG4gICAgICAgICAgICAvLyBcdTUyMjBcdTk2NjRcdTU4NkJcdTUxNDVcdTc2ODRcdTVDNUVcdTYwMjdcclxuICAgICAgICAgICAgcGx1Z2luczpbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZToncmVtb3ZlQXR0cnMnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOnthdHRyczpbXCJjbGFzc1wiLFwiZGF0YS1uYW1lXCIsXCJmaWxsXCIsXCJzdHJva2VcIl19XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgcHJpc21qcyh7XHJcbiAgICAgICAgICBsYW5ndWFnZXM6Wydqc29uJywnanMnLCdqYXZhJywneG1sJ11cclxuICAgICAgICB9KSxcclxuICAgICAgICAvL2VsZW1lbnQgcGx1cyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcclxuICAgICAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBWdWUgXHU1NDhDIFZ1ZS1yb3V0ZXIgXHU3NkY4XHU1MTczXHU1MUZEXHU2NTcwXHVGRjBDXHU1OTgyIHJlZiwgcmVhY3RpdmUsIGNyZWF0ZVJvdXRlciBcdTdCNDlcclxuICAgICAgICAgIGltcG9ydHM6Wyd2dWUnLCd2dWUtcm91dGVyJ10sXHJcbiAgICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgcmVzb2x2ZXJzOiBbXHJcbiAgICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBFbGVtZW50IFBsdXMgXHU3NkY4XHU1MTczXHU1MUZEXHU2NTcwXHVGRjBDXHU1OTgyXHVGRjFBRWxNZXNzYWdlLCBFbE1lc3NhZ2VCb3guLi4gKFx1NUUyNlx1NjgzN1x1NUYwRilcclxuICAgICAgICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcigpLFxyXG4gICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTU2RkVcdTY4MDdcdTdFQzRcdTRFRjZcclxuICAgICAgICAgICAgSWNvbnNSZXNvbHZlcih7XHJcbiAgICAgICAgICAgICAgLy8gcHJlZml4OiAnaScsIFx1OUVEOFx1OEJBNFx1NEUzQWlcdUZGMENcdTYyNDBcdTRFRTVcdTUzRUZcdTRFRTVcdTRFMERcdTc1MjhcdTU4RjBcdTY2MEVcclxuICAgICAgICAgICAgICBlbmFibGVkQ29sbGVjdGlvbnM6WydlcCcsJ2FudC1kZXNpZ24nXSAvL1x1NjMwN1x1NUI5QVx1NTZGRVx1NjgwN1x1OTZDNlx1NTQwOFx1RkYwQ0BpY29uaWZ5LWpzb24vZXAgXHU2NjJGIEVsZW1lbnQgcGx1cyBcdTc2ODRcdTU2RkVcdTY4MDdcdTVFOTNcclxuICAgIFxyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgZHRzOiBwYXRoLnJlc29sdmUocGF0aFNyYywgJ2F1dG8taW1wb3J0cy5kLnRzJyksXHJcbiAgICAgICAgfSksXHJcbiAgICBcclxuICAgICAgICAvLyBcdTVGMDBcdTU0MkZJY29uc1x1NTZGRVx1NjgwN1x1ODFFQVx1NTJBOFx1NEUwQlx1OEY3RFxyXG4gICAgICAgIEljb25zKHtcclxuICAgICAgICAgIGF1dG9JbnN0YWxsOiB0cnVlLFxyXG4gICAgICAgIH0pLFxyXG4gICAgXVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UixTQUFTLGVBQWUsV0FBVztBQUUxVCxTQUFTLGNBQWMs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
