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
import svgLoader from "file:///L:/scorpioncode/front/dashboard/node_modules/vite-svg-loader/index.js";
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
    svgLoader(),
    // 添加 SVG 加载器
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkw6XFxcXHNjb3JwaW9uY29kZVxcXFxmcm9udFxcXFxkYXNoYm9hcmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0w6L3Njb3JwaW9uY29kZS9mcm9udC9kYXNoYm9hcmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGdldFBsdWdpbnMgfSBmcm9tICcuL3BsdWdpbnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHttb2RlfSkgPT4ge1xyXG4gIC8vIFx1ODNCN1x1NTNENlx1NTQwNFx1NzlDRFx1NzNBRlx1NTg4M1x1NEUwQlx1NzY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1NTNEOFx1OTFDRlxyXG4gIGxldCBlbnYgPSBsb2FkRW52KG1vZGUscHJvY2Vzcy5jd2QoKSlcclxuICByZXR1cm4ge1xyXG4gICAgLy90X2Vudlx1RkYxQWJhc2VcclxuICAgIGJhc2U6IGVudi5WSVRFX0JBU0VfVVJMLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1x1OTE0RFx1N0Y2RVx1NEVFM1x1NzQwNlxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgW2Vudi5WSVRFX0FQSV06IHtcclxuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfSE9TVCwgLy8gXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1NjUzOVx1NTNEOFx1OEJGN1x1NkM0Mlx1NTdERlx1NTQwRFxyXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtlbnYuVklURV9BUEl9YCksICcnKS8vXHU1QzA2XHU1MzlGXHU2NzA5XHU4QkY3XHU2QzQyXHU4REVGXHU1Rjg0XHU0RTJEXHU3Njg0YXBpXHU2NkZGXHU2MzYyXHU0RTNBJydcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBzY3NzXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6ICdAaW1wb3J0IFwiLi9zcmMvYXNzZXRzL3N0eWxlL2dsb2JhbC5zY3NzXCI7J1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IGdldFBsdWdpbnMoKVxyXG5cclxuICB9XHJcblxyXG59KSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiTDpcXFxcc2NvcnBpb25jb2RlXFxcXGZyb250XFxcXGRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiTDpcXFxcc2NvcnBpb25jb2RlXFxcXGZyb250XFxcXGRhc2hib2FyZFxcXFxwbHVnaW5zLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9MOi9zY29ycGlvbmNvZGUvZnJvbnQvZGFzaGJvYXJkL3BsdWdpbnMuanNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gJ3VucGx1Z2luLWljb25zL3Jlc29sdmVyJ1xyXG5pbXBvcnQgeyBjcmVhdGVTdmdJY29uc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHByaXNtanMgZnJvbSAndml0ZS1wbHVnaW4tcHJpc21qcyc7XHJcbmltcG9ydCBzdmdMb2FkZXIgZnJvbSAndml0ZS1zdmctbG9hZGVyJyAgLy8gc3ZnXHU1MkEwXHU4RjdEXHU1NjY4XHJcblxyXG4vLyBwYXRoU3JjIFx1NjYyRlx1N0VEOVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTZGRVx1NjgwN1x1NUU5M1x1NEY3Rlx1NzUyOFx1NzY4NFxyXG5jb25zdCBwYXRoU3JjID0gcGF0aC5yZWxhdGl2ZShfX2Rpcm5hbWUsJ3NyYycpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2lucygpe1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICB2dWUoKSxcclxuICAgICAgICAvLyBzdmdcdTdFQzRcdTRFRjZcclxuICAgICAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcbiAgICAgICAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9pY29ucycpXSxcclxuICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgICAgc3Znb09wdGlvbnM6e1xyXG4gICAgICAgICAgICAvLyBcdTUyMjBcdTk2NjRcdTU4NkJcdTUxNDVcdTc2ODRcdTVDNUVcdTYwMjdcclxuICAgICAgICAgICAgcGx1Z2luczpbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZToncmVtb3ZlQXR0cnMnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOnthdHRyczpbXCJjbGFzc1wiLFwiZGF0YS1uYW1lXCIsXCJmaWxsXCIsXCJzdHJva2VcIl19XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgc3ZnTG9hZGVyKCksICAvLyBcdTZERkJcdTUyQTAgU1ZHIFx1NTJBMFx1OEY3RFx1NTY2OFxyXG4gICAgICAgIHByaXNtanMoe1xyXG4gICAgICAgICAgbGFuZ3VhZ2VzOlsnanNvbicsJ2pzJywnamF2YScsJ3htbCddXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgLy9lbGVtZW50IHBsdXMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XHJcbiAgICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjUgVnVlIFx1NTQ4QyBWdWUtcm91dGVyIFx1NzZGOFx1NTE3M1x1NTFGRFx1NjU3MFx1RkYwQ1x1NTk4MiByZWYsIHJlYWN0aXZlLCBjcmVhdGVSb3V0ZXIgXHU3QjQ5XHJcbiAgICAgICAgICBpbXBvcnRzOlsndnVlJywndnVlLXJvdXRlciddLFxyXG4gICAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgICB9KSxcclxuICAgICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICAgIHJlc29sdmVyczogW1xyXG4gICAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjUgRWxlbWVudCBQbHVzIFx1NzZGOFx1NTE3M1x1NTFGRFx1NjU3MFx1RkYwQ1x1NTk4Mlx1RkYxQUVsTWVzc2FnZSwgRWxNZXNzYWdlQm94Li4uIChcdTVFMjZcdTY4MzdcdTVGMEYpXHJcbiAgICAgICAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoKSxcclxuICAgICAgICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU1NkZFXHU2ODA3XHU3RUM0XHU0RUY2XHJcbiAgICAgICAgICAgIEljb25zUmVzb2x2ZXIoe1xyXG4gICAgICAgICAgICAgIC8vIHByZWZpeDogJ2knLCBcdTlFRDhcdThCQTRcdTRFM0FpXHVGRjBDXHU2MjQwXHU0RUU1XHU1M0VGXHU0RUU1XHU0RTBEXHU3NTI4XHU1OEYwXHU2NjBFXHJcbiAgICAgICAgICAgICAgZW5hYmxlZENvbGxlY3Rpb25zOlsnZXAnLCdhbnQtZGVzaWduJ10gLy9cdTYzMDdcdTVCOUFcdTU2RkVcdTY4MDdcdTk2QzZcdTU0MDhcdUZGMENAaWNvbmlmeS1qc29uL2VwIFx1NjYyRiBFbGVtZW50IHBsdXMgXHU3Njg0XHU1NkZFXHU2ODA3XHU1RTkzXHJcbiAgICBcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIGR0czogcGF0aC5yZXNvbHZlKHBhdGhTcmMsICdhdXRvLWltcG9ydHMuZC50cycpLFxyXG4gICAgICAgIH0pLFxyXG4gICAgXHJcbiAgICAgICAgLy8gXHU1RjAwXHU1NDJGSWNvbnNcdTU2RkVcdTY4MDdcdTgxRUFcdTUyQThcdTRFMEJcdThGN0RcclxuICAgICAgICBJY29ucyh7XHJcbiAgICAgICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcclxuICAgICAgICB9KSxcclxuICAgIF1cclxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVIsU0FBUyxlQUFlLFdBQVc7QUFFMVQsU0FBUyxjQUFjLGVBQWU7OztBQ0Z5TyxPQUFPLFNBQVM7QUFDL1IsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFDcEMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sVUFBVTtBQUNqQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxlQUFlO0FBVHRCLElBQU0sbUNBQW1DO0FBWXpDLElBQU0sVUFBVSxLQUFLLFNBQVMsa0NBQVUsS0FBSztBQUV0QyxTQUFTLGFBQVk7QUFDeEIsU0FBTztBQUFBLElBQ0gsSUFBSTtBQUFBO0FBQUEsSUFFSixxQkFBcUI7QUFBQSxNQUNuQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUEsTUFDMUQsVUFBVTtBQUFBLE1BQ1YsYUFBWTtBQUFBO0FBQUEsUUFFVixTQUFRO0FBQUEsVUFDTjtBQUFBLFlBQ0UsTUFBSztBQUFBLFlBQ0wsUUFBTyxFQUFDLE9BQU0sQ0FBQyxTQUFRLGFBQVksUUFBTyxRQUFRLEVBQUM7QUFBQSxVQUNyRDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxVQUFVO0FBQUE7QUFBQSxJQUNWLFFBQVE7QUFBQSxNQUNOLFdBQVUsQ0FBQyxRQUFPLE1BQUssUUFBTyxLQUFLO0FBQUEsSUFDckMsQ0FBQztBQUFBO0FBQUEsSUFFRCxXQUFXO0FBQUE7QUFBQSxNQUVULFNBQVEsQ0FBQyxPQUFNLFlBQVk7QUFBQSxNQUMzQixXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxJQUNuQyxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxXQUFXO0FBQUE7QUFBQSxRQUVULG9CQUFvQjtBQUFBO0FBQUEsUUFFcEIsY0FBYztBQUFBO0FBQUEsVUFFWixvQkFBbUIsQ0FBQyxNQUFLLFlBQVk7QUFBQTtBQUFBLFFBRXpDLENBQUM7QUFBQSxNQUNEO0FBQUEsTUFDQSxLQUFLLEtBQUssUUFBUSxTQUFTLG1CQUFtQjtBQUFBLElBQ2hELENBQUM7QUFBQTtBQUFBLElBR0QsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBLElBQ2YsQ0FBQztBQUFBLEVBQ0w7QUFDSjs7O0FENUQ2SyxJQUFNLDJDQUEyQztBQU05TixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFDLEtBQUksTUFBTTtBQUV0QyxNQUFJLE1BQU0sUUFBUSxNQUFLLFFBQVEsSUFBSSxDQUFDO0FBQ3BDLFNBQU87QUFBQTtBQUFBLElBRUwsTUFBTSxJQUFJO0FBQUEsSUFDVixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxDQUFDLElBQUksUUFBUSxHQUFHO0FBQUEsVUFDZCxRQUFRLElBQUk7QUFBQTtBQUFBLFVBQ1osY0FBYztBQUFBO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFBQTtBQUFBLFFBQ3BFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osbUJBQW1CO0FBQUEsVUFDbkIsZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxXQUFXO0FBQUEsRUFFdEI7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
