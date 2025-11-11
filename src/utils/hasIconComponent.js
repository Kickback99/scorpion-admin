import { useIconStore } from "@/store/icon";
/**
 * 通用分析函数 - 检查组件是否有 icon 和 useRenderIcon 属性，收集 Element Plus 图标
 */
export async function analyzeComponent(importPath) {
  try {
    // 导入原始文件内容
    const rawModule = await import(/*@vite-ignore*/ `${importPath}?raw`);
    const templateMatch = rawModule.default.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    const styleMatch = rawModule.default.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    
    console.log('正在分析的组件路径:', importPath);
    
    if (!templateMatch) {
      return false;
    }

    const template = templateMatch[1];
    const styleContent = styleMatch ? styleMatch[1] : '';
    
    let hasValidIcon = false;
    const svgIcons = [];
    const alibabaIcons = [];
    
    // 1. 检查是否有符合条件的 icon 属性或 useRenderIcon
    hasValidIcon = checkValidIconUsage(template);
    
    // 2. 收集 SVG 图标
    collectSvgIcons(template, svgIcons);
    
    // 3. 收集阿里巴巴图标
    collectAlibabaIcons(template, styleContent, alibabaIcons);
    
    // 保存到 store
    saveToStore(svgIcons, alibabaIcons);
    
    console.log(`🎯 ${importPath} 分析结果:`, { 
      hasValidIcon, 
      svgCount: svgIcons.length, 
      alibabaCount: alibabaIcons.length 
    });
    
    return hasValidIcon;
    
  } catch (error) {
    console.warn(`⚠️ 无法分析组件 ${importPath}:`, error.message);
    return false;
  }
}

/**
 * 检查是否有符合条件的 icon 属性或 useRenderIcon
 */
function checkValidIconUsage(template) {
  // 1. 检查 useRenderIcon
  if (template.includes('useRenderIcon')) {
    return true;
  }
  
  // 2. 检查 icon 属性，但排除 IconFont 标签
  const iconMatches = template.matchAll(/<([^>]+)icon=(["'])([^"']*)\2[^>]*>/g);
  
  for (const match of iconMatches) {
    const tagContent = match[1];
    const iconValue = match[3];
    
    // 如果标签不是 IconFont，且包含 icon 属性，则返回 true
    if (!tagContent.includes('IconFont') && iconValue) {
      return true;
    }
  }
  
  return false;
}

/**
 * 收集 SVG 图标
 */
function collectSvgIcons(template, svgIcons) {
  const svgIconMatches = template.matchAll(/<SvgIcon[^>]*name=(["'])([^"']*)\1[^>]*>/g);
  
  for (const match of svgIconMatches) {
    const fullTag = match[0];
    const name = match[2];
    
    // 提取 fill 属性
    const fillMatch = fullTag.match(/fill=(["'])([^"']*)\1/);
    const color = fillMatch ? fillMatch[2] : '';
    
    svgIcons.push({
      name,
      color
    });
    
    console.log(`🔍 发现 SVG 图标: ${name}`, color ? `[颜色: ${color}]` : '');
  }
}

/**
 * 收集阿里巴巴图标
 */
function collectAlibabaIcons(template, styleContent, alibabaIcons) {
  const iconFontMatches = template.matchAll(/<IconFont[^>]*>/g);
  
  for (const match of iconFontMatches) {
    const fullTag = match[0];
    
    // 提取 icon 属性
    const iconMatch = fullTag.match(/icon=(["'])([^"']*)\1/);
    if (!iconMatch) continue;
    
    const icon = iconMatch[2];
    let type = 'iconfont';
    let color = '';
    
    // 判断类型
    if (fullTag.includes('uni')) {
      type = 'uni';
    } else if (fullTag.includes('svg')) {
      type = 'svg';
    }
    
    // 提取颜色
    if (type === 'svg') {
      // SVG 类型：只找 fill 属性
      const fillMatch = fullTag.match(/fill=(["'])([^"']*)\1/);
      color = fillMatch ? fillMatch[2] : '';
    } else {
      // iconfont 和 uni 类型：先找 style 属性，再找 CSS 类
      const styleMatch = fullTag.match(/style=(["'])([^"']*)\1/);
      if (styleMatch) {
        const styleContent = styleMatch[2];
        const colorMatch = styleContent.match(/color:\s*([^;]+)/);
        color = colorMatch ? colorMatch[1].trim() : '';
      }
      
      // 如果 style 属性没有找到颜色，查找 .iconfont 类的颜色
      if (!color && styleContent) {
        const fontClassMatch = styleContent.match(/\.iconfont[^{]*{[^}]*color:\s*([^;]+)/);
        if (fontClassMatch) {
          color = fontClassMatch[1].trim();
        }
      }
    }
    
    alibabaIcons.push({
      type,
      icon,
      color
    });
    
    console.log(`🔍 发现阿里巴巴图标:`, { type, icon, color });
  }
}

/**
 * 保存数据到 store
 */
function saveToStore(svgIcons, alibabaIcons) {
  const iconStore = useIconStore();
  
  // 保存 SVG 图标（去重）
  if (svgIcons.length > 0) {
    const uniqueSvgIcons = [];
    const seen = new Set();
    
    svgIcons.forEach(icon => {
      const key = `${icon.name}-${icon.color}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSvgIcons.push(icon);
      }
    });
    
    // 合并到现有数据
    const allSvgIcons = [...iconStore.svgIcons, ...uniqueSvgIcons];
    const finalSvgIcons = [];
    const finalSeen = new Set();
    
    allSvgIcons.forEach(icon => {
      const key = `${icon.name}-${icon.color}`;
      if (!finalSeen.has(key)) {
        finalSeen.add(key);
        finalSvgIcons.push(icon);
      }
    });
    
    iconStore.svgIcons = finalSvgIcons;
    console.log(`💾 保存 SVG 图标:`, finalSvgIcons);
  }
  
  // 保存阿里巴巴图标（去重）
  if (alibabaIcons.length > 0) {
    const uniqueAlibabaIcons = [];
    const seen = new Set();
    
    alibabaIcons.forEach(icon => {
      const key = `${icon.type}-${icon.icon}-${icon.color}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAlibabaIcons.push(icon);
      }
    });
    
    // 合并到现有数据
    const allAlibabaIcons = [...iconStore.alibabaIcons, ...uniqueAlibabaIcons];
    const finalAlibabaIcons = [];
    const finalSeen = new Set();
    
    allAlibabaIcons.forEach(icon => {
      const key = `${icon.type}-${icon.icon}-${icon.color}`;
      if (!finalSeen.has(key)) {
        finalSeen.add(key);
        finalAlibabaIcons.push(icon);
      }
    });
    
    iconStore.alibabaIcons = finalAlibabaIcons;
    console.log(`💾 保存阿里巴巴图标:`, finalAlibabaIcons);
  }
}

/**
 * 根据组件定义构建完整的导入路径
 */
export function getComponentImportPath(component) {
  if (typeof component === 'function') {
    // 动态导入函数：() => import('@/path/to/component.vue')
    const importPath = component.toString();
    const match = importPath.match(/import\("([^"]+)"\)/);
    if (match) {
      // 将 @ 符号替换为 /src，并去掉时间戳参数
      let path = match[1].replace(/^@\//, '/src/');
      // 去掉 ?t= 时间戳参数
      path = path.replace(/\?t=\d+$/, '');
      return path;
    }
  } else if (component && component.__file) {
    // 直接导入的组件：从 __file 构建路径
    // __file: "L:/project/src/test/Learn.vue" → '/src/test/Learn.vue'
    const fullPath = component.__file;
    // 提取 src 及后面的部分
    const srcIndex = fullPath.indexOf('src');
    if (srcIndex !== -1) {
      const relativePath = fullPath.substring(srcIndex).replace(/\\/g, '/');
      return `/${relativePath}`;
    }
  }
  
  return null;
}