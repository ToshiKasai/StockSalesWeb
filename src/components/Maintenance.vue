<template lang="pug">
  div
    el-row
      el-col(:xs="8" :sm="6" :md="4" :lg="3")
        el-menu.rightSpace(mode="vertical" theme="dark" :router="true" :default-active="activeIndex")
          el-menu-item(index="/mainte") 管理メニュー
          el-menu-item(index="/mainte/users") ユーザーメンテ
          // el-menu-item(index="/mainte/roles") ロールメンテ
          el-menu-item(index="/mainte/makers") メーカーメンテ
          el-menu-item(index="/mainte/products") 商品メンテ
          el-menu-item(index="/mainte/groups") グループメンテ
          el-menu-item(index="/mainte/dashboards") ダッシュボードメンテ
      el-col(:xs="16" :sm="18" :md="20" :lg="21" v-loading="nowLoading" :element-loading-text="loadingMessage")
        router-view
</template>
<script>
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: '管理機能'
    }
  },
  computed: {
    nowLoading() {
      return this.$store.getters.nowLoadingMainte
    },
    loadingMessage() {
      return this.$store.getters.loadingMessage
    },
    activeIndex() {
      return this.$store.getters.activeIndex
    }
  }
}
</script>
<style lang="scss" scoped>
.rightSpace {
  margin-right: 8px;
}
</style>
