<template lang="pug">
  div.basemargin
    el-row
      el-col(:span="2") 編集対象
      el-col(:span="22" v-text="group.name")
    el-row
      el-col(:span="12")
        el-table(:data="myProducts" style="width: 100%" height="400")
          el-table-column(label="グループ商品")
            el-table-column(property="code" label="コード" width="120")
            el-table-column(property="name" label="商品名")
      el-col(:span="12")
        el-table(ref="multipleTable" :data="products" style="width: 100%" height="400" @selection-change="selectChange")
          el-table-column(label="メーカー一覧")
            el-table-column(type="selection" width="55")
            el-table-column(property="code" label="コード" width="120")
            el-table-column(property="name" label="商品名")
    el-button(type="primary" @click="submitForm") 変更
    el-button(@click="cancel") キャンセル
</template>
<script>
import Enumerable from 'linq'
import { makeArray, makeSingle } from '@/libraries/supports'
export default {
  props: ['id'],
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'グループ商品',
      group: {},
      products: [],
      myProducts: []
    }
  },
  methods: {
    getGroup() {
      return this.$store.dispatch('maintenance/getGroup', this.id).then((response) => {
        var item = response.data
        this.group = makeSingle(item, 'object')
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error.message })
      })
    },
    getProducts() {
      return this.$store.dispatch('maintenance/getProductList', this.group.makerModelId).then((response) => {
        var items = makeArray(response.data)
        this.products = Enumerable.from(items).orderBy(x => x.code).toArray()
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error.message })
      })
    },
    getGroupProducts() {
      return this.$store.dispatch('maintenance/getGroupProducts', this.id).then((response) => {
        var items = makeArray(response.data, 'object')
        this.myProducts = items
        var productId = Enumerable.from(items).orderBy(x => x.id).select(x => x.id).toArray()
        var tmpProduct = Enumerable.from(this.products).where(x => { return productId.indexOf(x.id) >= 0 }).toArray()
        tmpProduct.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error.message })
      })
    },
    getScreenData() {
      this.$store.dispatch('nowLoadingMainte', 'ユーザー情報処理中')
      this.getGroup().then(() => {
        this.getProducts().then(() => {
          this.getGroupProducts().then(() => {
            this.$store.dispatch('endLoading')
          })
        })
      })
    },
    submitForm() {
      this.$store.dispatch('nowLoadingMainte', 'ユーザー情報更新中')
      this.$store.dispatch('maintenance/setUserMakers', { id: this.id, makers: this.makers }).then((response) => {
        this.$notify({ title: '変更完了', message: 'ユーザー情報の更新を行いました' })
        this.$store.dispatch('endLoading')
        this.$router.go(-1)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error.message })
        this.$store.dispatch('endLoading')
      })
    },
    cancel() {
      this.$router.go(-1)
    },
    selectChange(sels) {
      this.myProducts = sels
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
      vm.$store.commit('changeBreadcrumb',
        { path: vm.$route.path, name: vm.title }
      )
    })
  }
}
</script>
