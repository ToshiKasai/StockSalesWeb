<template lang="pug">
  div
    el-button(@click="groupadd") 新規登録
    el-table(:data="groups" stripe height="480")
      el-table-column(prop="code" label="コード" sortable width="150")
      el-table-column(prop="name" label="グループ名" min-width="200")
      el-table-column(prop="makerCode" label="メーカー" sortable min-width="200")
        template(scope="scope") {{scope.row.makerCode}} : {{scope.row.makerName}}
      el-table-column(prop="deleted" label="削除" :filters="disabledFilters" :filter-method="filterDisabled" filter-placement="bottom-end" :filter-multiple="false" width="100")
        template(scope="scope")
          span {{scope.row.deleted | deletedMessage}}
      el-table-column(label="機能" fixed="left" width="150")
        template(scope="scope")
          el-button(size="small" @click="edit(scope.row.id)") edit
          el-button(size="small" @click="product(scope.row.id)") product
</template>
<script>
import { makeArray } from '@/libraries/supports'
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'グループ管理',
      groups: [],
      disabledFilters: [{ text: '削除', value: 'true' }, { text: '未削除', value: 'false' }]
    }
  },
  methods: {
    filterDisabled(value, row) {
      return row.deleted.toString() === value
    },
    getGroups() {
      this.$store.dispatch('nowLoadingMainte', 'グループ情報処理中')
      this.$store.dispatch('maintenance/getGroups').then((response) => {
        this.groups = makeArray(response.data)
        this.$store.dispatch('endLoading')
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error.message })
        this.$store.dispatch('endLoading')
      })
    },
    edit(id) {
      this.$router.push({ name: 'groupedit', params: { id: id } })
    },
    product(id) {
      this.$router.push({ name: 'groupproduct', params: { id: id } })
    },
    groupadd() {
      this.$router.push({ name: 'groupadd' })
    }
  },
  created() {
    this.getGroups()
  },
  watch: {
    '$route': 'getGroups'
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit('changeBreadcrumb',
        { path: vm.$route.path, name: vm.title }
      )
    })
  }
}
</script>
