import { h, defineComponent } from "vue";
import { Icon as IconifyIcon, addIcon } from "@iconify/vue/dist/offline";
import { getIcon } from '@iconify/vue';

import Check from "@iconify-icons/ep/check";
import Bell from "@iconify-icons/ep/bell";
addIcon("check", Check);
addIcon("bell", Bell);
addIcon("ep:aim",{
  body: {
    // body属性是必填的
			"body": "<path fill=\"currentColor\" d=\"M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896\"/><path fill=\"currentColor\" d=\"M512 96a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32m0 576a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V704a32 32 0 0 1 32-32M96 512a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H128a32 32 0 0 1-32-32m576 0a32 32 0 0 1 32-32h192a32 32 0 1 1 0 64H704a32 32 0 0 1-32-32\"/>"
		},
  width:1024,
  height:1024
})

const renderIcon = (icon) => {
  console.log(getIcon(icon))
  addIcon(icon, getIcon(icon));
}


// Iconify Icon在Vue里本地使用（用于内网环境）
export default defineComponent({
  name: "OfflineIcon",
  components: { IconifyIcon },
  props: {
    icon: {
      default: null
    }
  },
  render() {
    if (typeof this.icon === "object") addIcon(this.icon, this.icon);
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