<template>
    <div class="common-layout">
      <el-container>
        <el-aside width="200px">
          <el-menu
              active-text-color="#ffd04b" 
              background-color="#232323" 
              text-color="#fff"
            >
              <!--多级菜单-->
              <el-sub-menu index="1" unique-opened>
                  <template #title>
                      <el-icon><Aim /></el-icon> <span>xx管理</span>
                  </template>
                  <!--展开的每一个菜单项-->
                  <el-menu-item index="1-1">
                      <el-icon><Aim /></el-icon> <span>xx列表1</span>
                  </el-menu-item>
                  
                  <el-menu-item index="1-2">
                      <el-icon><Aim /></el-icon> <span>xx列表2</span>
                  </el-menu-item>
                  
                  <el-menu-item index="1-3">
                      <el-icon><Aim /></el-icon> <span>xx列表3</span>
                  </el-menu-item>
              </el-sub-menu>
              
              <!--与多级菜单同级的菜单项-->
              <el-menu-item index="2">
                  <el-icon><Aim /></el-icon> <span>xx管理</span>
              </el-menu-item>
              <!--与多级菜单同级的菜单项-->
              <el-menu-item index="3">
                  <el-icon><Aim /></el-icon> <span>xx管理</span>
              </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header>Header</el-header>
          <el-main><router-view></router-view></el-main>
          <el-footer>Footer</el-footer>
        </el-container>
      </el-container>
    </div>
  </template>
  
  <script setup>
  
  </script>
  
  <style lang="scss" scoped>
  .el-container{
    height: 100vh;
  }
  
  .el-aside {
    background-color: #232323;
  }
  </style>