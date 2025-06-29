import { h, defineComponent } from "vue";
import { Icon as IconifyIcon } from "@iconify/vue";

// Iconify Icon在Vue里在线使用（用于外网环境）
export default defineComponent({
  name: "IconifyOnline",
  components: { IconifyIcon },
  props: {
    icon: {
      type: String,
      default: ""
    },
    type:{
      type:String,
      default:'ep'
    }
  },
  render() {
    const attrs = this.$attrs;
    return h(
      IconifyIcon,
      {
        icon: `${this.type}:${this.icon}`,
        ...attrs
      },
      {
        default: () => []
      }
    );
  }
});
