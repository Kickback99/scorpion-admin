import Learn from '@/test/Learn.vue';

export const plainComData = [
    {name:'hello',component:()=>import('@/utils/hello.vue')},
    {name:'practise',component:()=>import('@/test/Practise.vue')},
    {name:'learn',component:Learn}
]