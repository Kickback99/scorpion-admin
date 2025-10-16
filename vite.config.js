import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { getPlugins } from './plugins'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  // 获取各种环境下的对应的变量
  let env = loadEnv(mode,process.cwd())
  return {
    base: env.VITE_BASE_URL,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    //配置代理
    server: {
      proxy: {
        [env.VITE_API]: {
          target: env.VITE_HOST, // 后端服务器地址
          changeOrigin: true, // 是否改变请求域名
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API}`), '')//将原有请求路径中的api替换为''
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

  }

})