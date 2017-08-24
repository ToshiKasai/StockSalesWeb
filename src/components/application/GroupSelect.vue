<template lang="pug">
  div
    el-form
      el-form-item(label="選択メーカー")
        |{{selectMaker.code}} : {{selectMaker.name}}
    el-tooltip.item(effect="dark" content="商品数によっては時間がかかったり重くなったりします" placement="right")
      el-button(@click="groupSkip") メーカー全商品を見る
    el-table(ref="groupTable" :data="groups" height="480" stripe
      highlight-current-row @row-click="groupSelect")
      el-table-column(prop="code" label="コード" width="150")
      el-table-column(prop="name" label="名称")
</template>
<script>
import Enumerable from 'linq'
import { makeArray } from '@/libraries/supports'
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'グループ選択',
      groups: [],
      selectMaker: this.$store.getters.selectMaker
    }
  },
  methods: {
    getScreenData() {
      this.$store.dispatch('nowLoading', 'データ取得中')
      this.$store.dispatch('getGroupsByMakerId', this.selectMaker.id).then((value) => {
        this.groups = Enumerable.from(makeArray(value.data)).orderBy(x => x.code).toArray()
        this.$store.dispatch('endLoading')
      }, (reasone) => {
        this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message })
      })
    },
    groupSelect(row, event, column) {
      this.$store.commit('selectGroup', row)
      this.$router.push('/salesviews')
    },
    groupSkip() {
      this.$store.commit('selectGroup', null)
      this.$router.push('/salesviews')
    }
  },
  created() {
    this.getScreenData()
  },
  watch: {
    '$route': 'getScreenData'
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.$store.getters.selectMaker === null || vm.$store.getters.selectMaker.id === 0) {
        return '/'
      }
      vm.$store.commit('changeBreadcrumb',
        { path: vm.$route.path, name: vm.title }
      )
    })
  }
}
</script>
