import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// pathSrc 是给自动导入图标库使用的
const pathSrc = path.relative(__dirname,'src')

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
    //配置代理
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8800', // 后端服务器地址
          changeOrigin: true, // 是否改变请求域名
          rewrite: (path) => path.replace(/^\/api/, '')//将原有请求路径中的api替换为''
        }
      }
    },
  plugins: [
    vue(),
    // svg组件
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions:{
        plugins:[
          {
            name:'removeAttrs',
            params:{attrs:["class","data-name","fill","stroke"]}
          }
        ]
      }
    }),
    //element plus 自动导入插件
    AutoImport({
      // 自动导入 Vue 和 Vue-router 相关函数，如 ref, reactive, createRouter 等
      imports:['vue','vue-router'],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          // prefix: 'i', 默认为i，所以可以不用声明
          enabledCollections:['ep','ant-design'] //指定图标集合，@iconify-json/ep 是 Element plus 的图标库

      }),
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),

    // 开启Icons图标自动下载
    Icons({
      autoInstall: true,
    }),
  ]
})