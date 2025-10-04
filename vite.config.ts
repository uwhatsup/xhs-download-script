import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn, util } from 'vite-plugin-monkey'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import packageJson from './package.json'
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
    }),
    Components({
      resolvers: [
        // 自动注册 Element Plus 组件
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://picasso-static.xiaohongshu.com/fe-platform/f43dc4a8baf03678996c62d8db6ebc01a82256ff.png',
        author: 'waelun',
        namespace: 'waelun',
        description: '小红书图片、视频、实况下载',
        match: [
          'https://www.xiaohongshu.com/*',
          'https://www.xiaohongshu.com/explore/*',
        ],
        name: '小红书下载助手',
        license: 'MIT',
        'run-at': 'document-end',
        version: packageJson.version,
        connect: ['*'],
      },
      build: {
        externalGlobals: {
          vue: cdn
            .jsdelivr('Vue', 'dist/vue.global.prod.min.js')
            .concat(util.dataUrl(';window.Vue=Vue;window.VueDemi=Vue;')),
          dayjs: cdn.jsdelivr('dayjs', 'dayjs.min.js'),
          streamsaver: cdn
            .jsdelivr('StreamSaver', 'StreamSaver.js')
            .concat(util.dataUrl(';window.StreamSaver=streamSaver;')),
          pinia: cdn
            .jsdelivr('Pinia', 'dist/pinia.iife.prod.js')
            .concat(util.dataUrl(';window.Pinia=Pinia;')),
          'pinia-plugin-persistedstate': cdn.jsdelivr(
            'piniaPluginPersistedstate',
            'dist/index.global.js'
          ),
        },
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/style/element.scss" as *;`,
      },
    },
  },
  // build: {
  //   minify: true,
  // },
})
