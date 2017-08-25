<template lang="pug">
  div
    el-table(:data="dashboards" stripe height="480")
      el-table-column(prop="startDateTime" label="掲載開始" :sortable="true" width="180")
        template(scope="scope")
          span {{scope.row.startDateTime | converetDateTimeFormat}}
      el-table-column(prop="endDateTime" label="掲載終了" :sortable="true" width="180")
        template(scope="scope")
          span {{scope.row.endDateTime | converetDateTimeFormat}}
      el-table-column(prop="priority" label="優先度" min-width="50")
      el-table-column(prop="message" label="掲載文" min-width="200")
        template(scope="scope")
          div {{scope.row.message | truncate(20)}}
      el-table-column(prop="deleted" label="削除" :filters="disabledFilters" :filter-method="filterDisabled" filter-placement="bottom-end" :filter-multiple="false" width="100")
        template(scope="scope")
          span {{scope.row.deleted | deletedMessage}}
      el-table-column(prop="createdDateTime" label="登録日時" :sortable="true" width="180")
        template(scope="scope")
          span {{scope.row.createdDateTime | converetDateTimeFormat}}
      el-table-column(prop="modifiedDateTime" label="最終変更日時" :sortable="true" width="180")
        template(scope="scope")
          span {{scope.row.modifiedDateTime | converetDateTimeFormat}}
      el-table-column(label="機能" fixed="left" width="150")
        template(scope="scope")
          el-button(disabled size="small" @click="edit(scope.row.id)") edit
          el-button(disabled size="small" @click="delete(scope.row.id)") delete
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
      title: 'ダッシュボード管理',
      dashboards: [],
      disabledFilters: [{ text: '削除', value: 'true' }, { text: '未削除', value: 'false' }]
    }
  },
  methods: {
    filterDisabled(value, row) {
      return row.deleted.toString() === value
    },
    edit(id) {
      // this.$router.push({ name: 'useredit', params: { id: id } })
    },
    delete(id) {
      // this.$router.push({ name: 'userroles', params: { id: id } })
    },
    getDashboard() {
      return this.$store.dispatch('maintenance/getDashboards').then((response) => {
        this.dashboards = makeArray(response.data)
      }).catch((error) => {
        this.$notify({ title: 'Warning', message: error.message, type: 'warning' })
      })
    },
    initialize() {
      this.$store.dispatch('nowLoadingMainte', 'ダッシュボード情報処理中')
      this.getDashboard().then(() => {
        this.$store.dispatch('endLoading')
      })
    }
  },
  created() {
    this.initialize()
  },
  watch: {
    '$route': 'initialize'
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
<style lang="scss" scoped>
.single_overflow {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
