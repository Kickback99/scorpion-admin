import { useUserStore } from "@/store/user"

// 通过自定义指令来控制权限按钮dom的删除
export const setPerm = (app) => {
    /* app.directive('perm',{
        mounted(el,binding) {
            const store = useUserStore()
            console.dir(el)
            if(!store.userPerm.includes(binding.value)){
                el.remove()
            }
        },
    }) */
}