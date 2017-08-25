<template lang="pug">
  div
    el-form(label-width="150px" :inline="true" )
      el-form-item(label="選択メーカー")
        |{{selectMaker.code}} : {{selectMaker.name}}
      el-form-item(label="選択グループ" v-show="selectGroup!==null")
        |{{selectGroup?selectGroup.code:''}} : {{selectGroup?selectGroup.name:''}}
      el-form-item(label="年度")
        el-select(v-model="tmpYear" @change="changeYear")
          el-option(v-for="item in optYear" :key="item.value" :label="item.label" :value="item.value")
    el-button(@click="downloadData" :loading="downloadFlag" v-bind="{'disabled' : downloadFlag}") 現在のデータをダウンロード
    el-card.box-card(v-for="data in selectViews" :id="'article-' + data.product.code" :key="data.product.code")
      product-table(:showData.sync="data")
    div#floadBtnMenu(@click="showMenu")
      i.material-icons &#xE5D2;
    div#floatButton(@click="scrollTop" v-show="scrollPosition>=500")
      i.material-icons &#xE5D8;
    transition(name="slideLeft")
      div.overlay(v-show="toggleMenu" @click="closeMenu")
    transition(name="bounceLeft")
      div.floatMenu(v-show="toggleMenu")
        // ul(style="list-style:none;")
        li(v-for="data in selectViews" @click="scrollProduct(data.product)") {{data.product.code}} : {{data.product.name | truncate(30)}}
</template>
<script>
import Enumerable from 'linq'
import moment from 'moment'
import ProductTable from './subcomponents/ProductTable.vue'
import { makeArray } from '@/libraries/supports'
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  components: { ProductTable },
  data() {
    return {
      title: '商品データ一覧',
      selectViews: [],
      toggleMenu: false,
      scrollPosition: 0,
      scrollEventFlag: false,
      tmpYear: this.year,
      optYear: [],
      downloadFlag: false
    }
  },
  computed: {
    year() {
      return this.$store.getters.selectYear
    },
    selectMaker() {
      return this.$store.getters.selectMaker
    },
    selectGroup() {
      return this.$store.getters.selectGroup
    }
  },
  methods: {
    startWatchingScroll() {
      if (this.scrollEventFlag === false) {
        document.addEventListener('scroll', this.getScrollTop)
        this.scrollEventFlag = true
      }
    },
    endWatchingScroll() {
      if (this.scrollEventFlag) {
        document.removeEventListener('scroll', this.getScrollTop)
        this.scrollEventFlag = false
      }
    },
    getScrollTop() {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
      this.scrollPosition = scrollTop
    },
    getNowYear() {
      var tmp
      if (moment().month() < 10) {
        tmp = moment().year()
      } else {
        tmp = moment().year() + 1
      }
      return tmp
    },
    changeYear(value) {
      var tmp = this.year
      this.$store.commit('selectYear', value)
      if (tmp !== value) {
        this.getScreenData()
      }
    },
    getScreenData() {
      this.$store.dispatch('nowLoading', 'データ取得中')
      this.optYear = []
      for (var i = 2016; i < this.getNowYear() + 3; i++) {
        this.optYear.push({ value: i, label: i.toString() + '年度' })
      }
      if (this.year === null) {
        this.$store.commit('selectYear', this.getNowYear())
      }
      this.tmpYear = this.year

      this.selectViews = []
      var promise
      if (this.selectGroup === null) {
        promise = this.$store.dispatch('getSalesviewsByMakerId', { id: this.selectMaker.id, year: this.year })
      } else {
        promise = this.$store.dispatch('getSalesviewsByGroupId', { id: this.selectGroup.id, year: this.year })
      }
      promise.then((value) => {
        this.selectViews = Enumerable.from(makeArray(value.data)).orderBy(x => x.product.code).toArray()
        this.$store.dispatch('endLoading')
      }, (reasone) => {
        this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message })
      })
    },
    scrollTop() {
      this.$SmoothScroll(0, 1000)
    },
    showMenu() {
      this.toggleMenu = true
    },
    closeMenu() {
      this.toggleMenu = false
    },
    scrollProduct(product) {
      this.closeMenu()
      this.scrollTo(product.code)
    },
    scrollTo(id) {
      var dat = 'article-' + id
      var element = document.getElementById(dat)
      this.$SmoothScroll(element, 800)
    },
    downloadData() {
      this.downloadFlag = true
      var data = {
        url: 'api/salesviews/download',
        params: {
          'Year': this.year,
          'GroupId': this.selectGroup.id,
          'MakerId': this.selectMaker.id
        },
        responseType: 'blob'
      }
      this.$http.request(data).then((values) => {
        var fileName = 'Download' + this.year.toString()
        fileName = fileName + '_' + moment().format('YYYYMMDD_HHmmSSS').toString() + '.xlsx'
        this.downloadAsFile(fileName, values.data)
        this.downloadFlag = false
      }, (reasone) => {
        this.$notify.error({ title: 'Error', message: reasone.message })
        this.downloadFlag = false
      })
    },
    downloadAsFile(fileName, content) {
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(content, fileName)
      } else {
        var a = document.createElement('a')
        // document.body.appendChild(a)
        a.href = window.URL.createObjectURL(content)
        // a.download = fileName
        a.setAttribute('download', fileName || 'noname')
        a.click()
        // a.dispatchEvent(new CustomEvent('click'))
        // document.body.removeChild(a)
        // window.URL.revokeObjectURL(a.href)
      }
    }
  },
  created() {
    this.getScreenData()
    this.startWatchingScroll()
  },
  watch: {
    $route: (val, oVal) => {
      this.getScreenData()
      this.startWatchingScroll()
    }
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
  },
  beforeDestroy() {
    this.endWatchingScroll()
  },
  beforeRouteLeave(to, from, next) {
    this.endWatchingScroll()
    next()
  }

}
</script>
<style lang="scss" scoped>
.box-card {
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;
  overflow-x: scroll;
}

.subtitle {
  font-size: 14px;
}

#floadBtnMenu {
  position: fixed;
  left: 15px;
  top: 100px;
  i {
    font-size: 24px;
    color: #EFF2F7;
    width: 50px;
    height: 50px;
    margin: 0;
    border-radius: 50%;
    line-height: 50px;
    text-align: center;
    background-color: rgba(32, 160, 255, 0.2);
    transition-property: opacity, background, color;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    &:hover {
      background-color: rgb(32, 160, 255);
    }
  }
}

#floatButton {
  position: fixed;
  right: 15px;
  bottom: 30px;
  i {
    font-size: 24px;
    color: #EFF2F7;
    width: 50px;
    height: 50px;
    margin: 0;
    border-radius: 50%;
    line-height: 50px;
    text-align: center;
    background-color: rgba(71, 86, 105, 0.2);
    transition-property: opacity, background, color;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    &:hover {
      background-color: rgb(71, 86, 105);
    }
  }
}

.floatMenu {
  position: fixed;
  left: 8px;
  top: 30px;
  height: 90%;
  z-index: 4;
  background-color: #F9FAFC;
  transition: all 0.5s ease;
  box-shadow: 4px 4px 2px 0 rgba(0, 0, 0, 0.14), 6px 6px 1px -2px rgba(0, 0, 0, 0.2), 2px 2px 5px 0 rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  font-size: 14px;
  li {
    margin: 4px;
    padding: 8px;
    content: none;
    list-style: none;
    &:hover {
      background-color: #D3DCE6
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 3;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  opacity: 0.8;
  background-color: #324057;
}
</style>
