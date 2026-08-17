import { useUserStore } from "@/store/user"

/**
 * 判断当前用户是否拥有指定权限
 * 语义修正：有权限返回 true（旧 hasPermissions 语义相反，已彻底移除）
 * 注意：内部依赖 Pinia store，只能在组件 setup / 指令钩子等运行时调用
 */
export const hasPerm = (permissions) => {
    const store = useUserStore()
    return store.userPerm.includes(permissions)
}
