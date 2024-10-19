import { useUserStore } from "@/store/user"

export const hasPermissions = (permissions) =>{
    const store = useUserStore()
    return !store.userPerm.includes(permissions)    
}