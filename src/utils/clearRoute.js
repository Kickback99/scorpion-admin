import router from "@/router"

export const clearRoute = (res) => {
    res.forEach(item => {
        router.removeRoute(item.name)
        if(item.children && item.children.length > 0) {
            clearRoute(item.children)
        }
    })
    router.removeRoute('NotFound')
    router.removeRoute('404')
}