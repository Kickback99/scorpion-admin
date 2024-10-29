import { addCollection,listIcons } from '@iconify/vue';
import {prefix as epPrefix,icons as epIcons} from '@iconify-json/ep/icons.json'
import {prefix as riPrefix,icons as rIIcons} from '@iconify-json/ri/icons.json'
import {prefix as fasPrefix,icons as fasIcons} from '@iconify-json/fa-solid/icons.json'

// const icons = ["ep:setting","ri:table-view","ep:user","fa-solid:ad"]

// 动态批量离线加载图标
export function addBatchIconList(icons){
    console.log('批量加载调用了')
    // 创建一个Set来存储所有唯一的前缀
    const prefixes = new Set();

    // 遍历icons数组，提取所有唯一的前缀
    icons.forEach(item => {
      const [prefix] = item.split(':');
      prefixes.add(prefix);
    });

    // 创建一个对象来存储不同前缀的图标数据
    const iconData = {};

    // 为每个前缀创建一个对象来存储图标数据
    prefixes.forEach(prefix => {
      iconData[prefix] = { prefix: prefix, icons: {} };
    });

    // 遍历icons数组，将图标数据添加到相应的对象中
    icons.forEach(item => {
      const [prefix, key] = item.split(':');
      const dataObj = iconData[prefix];
      
      if (dataObj) {
        dataObj.icons[key] = getIconData(prefix, key);
      }
      // console.log(dataObj)
    });

    // 动态构建数组
    const arr = Object.values(iconData).map(dataObj => {
      return {
        prefix: dataObj.prefix,
        icons: dataObj.icons
      };
    });
    console.log(arr)
    arr.forEach(icon => {
      addCollection(icon)
    })

    console.log(listIcons());
}


// 假设有一个函数来获取图标数据
function getIconData(prefix, key) {
  let iconData;
  // 返回一个新对象，新对象都保留原始数据
  // 如果匹配的是epPrefix，添加宽高属性为1024
  if (prefix === epPrefix) {
    iconData = epIcons[key];
    if (iconData) {
      return {
        ...iconData,
        width: 1024,
        height: 1024
      };
    }
    // 如果匹配的是riPrefix，添加宽高属性为24
  } else if (prefix === riPrefix) {
    iconData = rIIcons[key];
    if (iconData) {
      return {
        ...iconData,
        width: 24,
        height: 24
      };
    }
    //如果匹配的是fasPrefix，就判断fasIcons[key]有没有宽属性，如果有则不添加宽高，如果没有宽属性则添加宽高
  } else if (prefix === fasPrefix) {
    iconData = fasIcons[key];
    if (iconData) {
      // 检查fasIcons[key]是否有width属性
      if (!iconData.width) {
        return {
          ...iconData,
          width: 1024,
          height: 1024
        };
      } else {
        // 如果fasIcons[key]已经有width属性，则不添加宽高
        return iconData;
      }
    }
  }

  // 如果没有匹配到任何前缀，或者图标数据不存在，则返回null
  return null; // 或者根据需求返回其他值或抛出错误
}