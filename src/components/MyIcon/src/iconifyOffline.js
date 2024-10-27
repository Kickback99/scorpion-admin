import { h, defineComponent } from "vue";
import { Icon as IconifyIcon, addIcon } from "@iconify/vue/dist/offline";
import { getIcon } from '@iconify/vue';

import Check from "@iconify-icons/ep/check";
import Bell from "@iconify-icons/ep/bell";
addIcon("check", Check);
addIcon("bell", Bell);

const renderIcon = (icon) => {
  console.log(getIcon(icon))
  addIcon(icon, getIcon(icon));
}


// Iconify Icon在Vue里本地使用（用于内网环境）
export default defineComponent({
  name: "IconifyOffline",
  components: { IconifyIcon },
  props: {
    icon: {
      default: null
    }
  },
  render() {
    if (typeof this.icon === "object") addIcon(this.icon, this.icon);
    // 如果传入的图标中包含":"，则getIcon来离线加载图标
    if(this.icon?.includes(':')) {
      console.log('触发了')
      renderIcon(this.icon)
    }
    const attrs = this.$attrs;
    return h(
      IconifyIcon,
      {
        icon: this.icon,
        style: attrs?.style
          ? Object.assign(attrs.style, { outline: "none" })
          : { outline: "none" },
        ...attrs
      },
      {
        default: () => []
      }
    );
  }
});
