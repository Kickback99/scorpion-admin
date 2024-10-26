import { h, defineComponent } from "vue";
import { Icon as IconifyIcon, addIcon } from "@iconify/vue/dist/offline";

import Check from "@iconify-icons/ep/check";
import Bell from "@iconify-icons/ep/bell";
addIcon("check", Check);
addIcon("bell", Bell);

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
