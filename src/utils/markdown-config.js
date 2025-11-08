// src/utils/markdown-config.js
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';

// 主题配置
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

import hljs from 'highlight.js';
import Prism from 'prismjs';

// 创建不同主题的预览器
export function createMarkdownPreview(theme = 'github') {
  const preview = VMdEditor;
  
  if (theme === 'github') {
    preview.use(githubTheme, { Hljs: hljs });
  } else if (theme === 'vuepress') {
    preview.use(vuepressTheme, { Prism });
  }
  
  return preview
    .use(createLineNumbertPlugin())
    .use(createCopyCodePlugin());
}

// 默认导出 github 主题的预览器
export default createMarkdownPreview('github');