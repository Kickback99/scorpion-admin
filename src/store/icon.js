import { defineStore } from "pinia";

export const useIconStore = defineStore({
    id:'icon',
    state:()=>({
        // ------------iconify------------
        // 在线图标收集
        onlineIcons:[],
        // 批量收集
        batchIcons:[],
        // 批量收集(已使用)
        batchUsedIcons:[],
        // 单个图标收集
        singleIcons:[],
        // 自定义图标收集
        customIcons:[],
        // 是否排除在线图标
        isExcludeInline:false,
        // 仅显示已使用的离线图标
        showBatchUsedIcons:false,

        // ------------elementplus图标------------

        elementIcons:[],

        // ------------svg图标------------
        svgIcons:[],

        // ------------alibaba图标------------
        alibabaIcons:[],

        // ------------按钮样式配置------------
        // full | plain
        buttonStyle: 'full',
        // full 模式: 0~100 light/dark 深度; plain 模式: 混合度百分比（默认35）
        buttonDepth: 0,
        // hover 强度 1~9（对应 light-1 ~ light-9），实心/描边独立
        buttonHoverFull: 3,
        buttonHoverPlain: 3,
        // 实心按钮文字色模式: 'preset'（配置文件）| 'dynamic'（动态计算亮度）
        textColorMode: 'preset',

    }),
    actions:{
        setOnlineIcons(data){
            this.onlineIcons = data
        },
        setBatchIcons(data){
            this.batchIcons = data
        },
        setBatchUsedIcons(data){
            this.batchUsedIcons = data
        },
        setSingleIcons(data){
            this.singleIcons = data
        },
        setCustomIcons(data){
            this.customIcons = data
        },
        setElementIcons(data){
            this.elementIcons = data
        },
        setSvgIcons(data){
            this.svgIcons = data;
        },
        setAlibabaIcons(data){
            this.alibabaIcons = data;
        },
        // 添加单个 SVG 图标
        addSvgIcon(icon) {
            const exists = this.svgIcons.some(item =>
                item.name === icon.name && item.color === icon.color
            );
            if (!exists) {
                this.svgIcons.push(icon);
            }
        },
        // 添加单个阿里巴巴图标
        addAlibabaIcon(icon) {
            const exists = this.alibabaIcons.some(item =>
                item.type === icon.type &&
                item.icon === icon.icon &&
                item.color === icon.color
            );
            if (!exists) {
                this.alibabaIcons.push(icon);
            }
        },
        setIsExcludeInline(data){
            this.isExcludeInline = data
        },
        setShowBatchUsedIcons(data){
            this.showBatchUsedIcons = data
        },
         // 重置筛选条件
        resetIconConditions(){
            this.isExcludeInline = false
            this.showBatchUsedIcons = false
        },
        // 清除当前所有数据
        clearIconStore(){
            this.$reset()
        },

        // ------------按钮样式------------
        setButtonStyle(style) {
            this.buttonStyle = style
        },
        setButtonDepth(depth) {
            this.buttonDepth = depth
        },
        setButtonHoverFull(hover) {
            this.buttonHoverFull = hover
        },
        setButtonHoverPlain(hover) {
            this.buttonHoverPlain = hover
        },
        setTextColorMode(mode) {
            this.textColorMode = mode
        },
    },
    persist: {
        key: 'icon-store',
        paths: ['buttonStyle', 'buttonDepth', 'buttonHoverFull', 'buttonHoverPlain', 'textColorMode'],
    },
})