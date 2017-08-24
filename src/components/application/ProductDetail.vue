<template lang="pug">
  div
    el-card.box-card-noscroll
      product-chart(:chart-data="datacollection" :options="chartOptions" :height="chartHeight")
    el-card.box-card(v-for="data in selectView" :key="data.product.code")
      div {{data.product.code}} : {{data.product.name}}
      .subtitle ({{data.product.isSoldWeight?'計量品':'ピース品'}}／ケース：{{data.product.quantity}}／パレット：{{data.product.paletteQuantity | placeholder('未登録')}}／リードタイム：{{data.product.leadTime | placeholder('未登録')}})
      el-button 保存
      product-table(:showData.sync="data" :refZaikoPlan="returnZaikoPlan" :results="recalc")
    el-card.box-card-noscroll
      el-table(:data="currentStock" height="300" stripe show-summary :summary-method="getSummaries" border)
        el-table-column(prop="warehouseCode" label="倉庫" sortable width="100")
        el-table-column(prop="warehouseName" label="倉庫名")
        el-table-column(prop="logicalQuantity" label="販売在庫" align="right" header-align="left" :formatter="showNumber" width="180")
        el-table-column(prop="actualQuantity" label="倉庫在庫" align="right" header-align="left" :formatter="showNumber" width="180")
        el-table-column(prop="expirationDate" label="賞味期限" :formatter="showNumber" sortable width="130")
        el-table-column(prop="stateName" label="打検"  width="100")
      el-row
        el-col(:span="8")
          el-table(:data="currentOrder" height="200" stripe border)
            el-table-column(prop="orderNo" label="発注Ｎｏ")
            el-table-column(prop="orderDate" label="発注日" :formatter="showNumber" width="130")
            el-table-column(prop="order" label="発注数" align="right" header-align="left" :formatter="showNumber" width="150")
        el-col(:span="16")
          el-table(:data="currentInvoice" height="200" stripe border)
            el-table-column(prop="invoiceNo" label="インボイスＮｏ")
            el-table-column(prop="purchaseDate" label="仕入日付" :formatter="showNumber" width="130")
            el-table-column(prop="quantity" label="仕入数量" align="right" header-align="left" :formatter="showNumber" width="150")
            el-table-column(prop="eta" label="入港日" :formatter="showNumber" width="130")
            el-table-column(prop="customsClearanceDate" label="通関日" :formatter="showNumber" width="130")
            el-table-column(prop="warehouseCode" label="倉庫" width="100")
    el-card.box-card-noscroll
      el-button(@click="newTrend") 販売動向を登録
      el-table(:data="salesTrends" height="300" stripe border fit v-loading="trendLoadFlg" element-loading-text="処理中")
        el-table-column(label="機能" fixed="left" width="200")
          template(scope="scope")
            el-button(size="small" @click="editTrend(scope.row)") 編集
            el-button(size="small" @click="deleteTrend(scope.row)") 削除
        el-table-column(prop="detail_date" label="年月" width="100")
          template(scope="scope")
            span {{scope.row.detail_date | converetDateFormat('YYYY/MM')}}
        el-table-column(prop="quantity" label="数量" align="right" header-align="left" width="180")
        el-table-column(prop="comments" label="コメント")
          template(scope="scope")
            span {{scope.row.comments | truncate(60)}}
        el-table-column(prop="user_name" label="入力/変更者" width="200")
    // SalesTrendの編集用ダイアログ
    el-dialog(title="販売動向" :visible.sync="dialogVisible")
      el-form(:model="form")
        el-form-item(label="日付" label-width="120")
          el-date-picker(v-model="form.targetdate" type="month" placeholder="対象年月" format="yyyy年MM月")
        el-form-item(label="コメント" label-width="120")
          el-input(placeholder="コメント" v-model="form.comments")
        el-form-item(label="数量" label-width="120")
          el-input-number(v-model="form.quantity")
      span.dialog-footer(slot="footer")
        el-button(@click="dialogVisible = false") Cancel
        el-button(type="primary" @click="registTrend") Confirm
</template>
<script>
import Enumerable from 'linq'
import moment from 'moment'
import ProductTable from './subcomponents/ProductTable.vue'
import ProductChart from './subcomponents/ProductChart.js'
import { makeArray, makeSingle } from '@/libraries/supports'
function currency(value, currency, decimals) {
  var digitsRE = /(\d{3})(?=\d)/g
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  currency = currency != null ? currency : '$'
  decimals = decimals != null ? decimals : 2
  var stringified = Math.abs(value).toFixed(decimals)
  var _int = decimals
    ? stringified.slice(0, -1 - decimals)
    : stringified
  var i = _int.length % 3
  var head = i > 0
    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
    : ''
  var _float = decimals
    ? stringified.slice(-1 - decimals)
    : ''
  var sign = value < 0 ? '-' : ''
  return sign + currency + head +
    _int.slice(i).replace(digitsRE, '$1,') +
    _float
}
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  props: ['id'],
  components: { ProductChart, ProductTable },
  data() {
    return {
      title: '商品データ詳細',
      selectView: null,
      singleData: null,
      datacollection: null,
      chartOptions: {
        title: { display: true, text: '情報チャート by M.Takayama' },
        legend: { display: true, position: 'bottom' },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.1,
            fill: true
          }
        },
        scales: {
          yAxes: [
            {
              display: true,
              type: 'linear',
              position: 'left',
              id: 'y-axis-1',
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 11,
                suggestedMin: 0,
                suggestedMax: 1000
              },
              gridLines: {
                display: true,
                color: 'rgba(0,0,0,0.3)',
                lineWidth: 1
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: true,
                color: 'rgba(0,0,0,0.3)',
                lineWidth: 1
              }
            }
          ]
        },
        tooltips: {
          mode: 'index',
          position: 'nearest'
        }
      },
      chartHeight: 400,
      zaikoPlan: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentStock: null,
      stockMaxDate: null,
      currentOrder: null,
      orderMaxDate: null,
      currentInvoice: null,
      invoiceMaxDate: null,
      salesTrends: null,
      trendLoadFlg: false,
      form: { id: null, targetdate: null, comments: null, quantity: null },
      dialogVisible: false
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
    makeChartData() {
      var tmp = {}
      tmp.labels = []
      tmp.datasets = []

      var i
      var dt
      for (i = 0; i < 12; i++) {
        tmp.labels.push(((i + 9) % 12 + 1).toString() + '月')
      }
      // 在庫予測
      dt = {}
      dt.label = '在庫予測'
      dt.backgroundColor = 'rgba(76,175,80, 0.1)'
      dt.borderColor = 'rgba(76,175,80, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.zaikoPlan[i + 1])
      }
      tmp.datasets.push(dt)
      // 在庫数
      dt = {}
      dt.label = '在庫数'
      dt.backgroundColor = 'rgba(3,169,244, 0.1)'
      dt.borderColor = 'rgba(3,169,244, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].zaiko_actual)
      }
      tmp.datasets.push(dt)
      // 販売予定
      dt = {}
      dt.label = '販売予定'
      dt.backgroundColor = 'rgba(156,39,176, 0.1)'
      dt.borderColor = 'rgba(156,39,176, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].sales_plan + this.singleData.salesList[i + 1].sales_trend)
      }
      tmp.datasets.push(dt)
      // 販売実績
      dt = {}
      dt.label = '販売実績'
      dt.backgroundColor = 'rgba(233,30,99, 0.1)'
      dt.borderColor = 'rgba(233,30,99, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].sales_actual)
      }
      tmp.datasets.push(dt)
      // 前年実績
      dt = {}
      dt.label = '前年実績'
      dt.backgroundColor = 'rgba(158,158,158, 0.1)'
      dt.borderColor = 'rgba(158,158,158, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].pre_sales_actual)
      }
      tmp.datasets.push(dt)
      // 入荷予定
      dt = {}
      dt.label = '入荷予定'
      dt.backgroundColor = 'rgba(121, 85, 72, 0.1)'
      dt.borderColor = 'rgba(121, 85, 72, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].invoice_plan)
      }
      tmp.datasets.push(dt)
      // 入荷実績
      dt = {}
      dt.label = '入荷実績'
      dt.backgroundColor = 'rgba(103, 58, 183, 0.1)'
      dt.borderColor = 'rgba(103, 58, 183, 1)'
      dt.data = []
      for (i = 0; i < 12; i++) {
        dt.data.push(this.singleData.salesList[i + 1].invoice_actual)
      }
      tmp.datasets.push(dt)

      this.datacollection = tmp
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
    getScreenData() {
      this.$store.dispatch('nowLoading', 'データ取得中')
      Promise.all([
        this.$store.dispatch('getSalesviewById', { id: this.id, year: this.year }),
        this.$store.dispatch('getStocksCurrent', this.id),
        this.$store.dispatch('getSalesTrends', { id: this.id, year: this.year })
      ]).then((value) => {
        this.selectView = makeArray(value[0].data, 'object')
        this.singleData = this.selectView[0]
        var current = makeSingle(value[1].data, 'object')
        this.orderMaxDate = current.orderMaxDate
        this.currentOrder = current.orders
        this.invoiceMaxDate = current.invoiceMaxDate
        this.currentInvoice = current.invoices
        this.stockMaxDate = current.stockMaxDate
        this.currentStock = current.stocks
        // this.currentStock = this.minotaka.makeArray(value[1].data, 'object')
        this.salesTrends = makeArray(value[2].data, 'object')
        // this.myMakers = Enumerable.from(this.minotaka.makeArray(value[1].data)).orderBy(x => x.code).toArray()
        this.makeChartData()
        this.$store.dispatch('endLoading')
      }, (reasone) => {
        this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message })
      })
    },
    getTrendData() {
      this.trendLoadFlg = true
      this.$store.dispatch('getSalesTrends', { id: this.id, year: this.year }).then((value) => {
        this.salesTrends = makeArray(value.data, 'object')
        this.trendLoadFlg = false
      })
    },
    percentage(param1, param2) {
      if (param2 === 0) {
        return 0
      } else {
        return param1 / param2 * 100
      }
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0 || index === 4 || index === 5) {
          return
        }
        if (index === 1) {
          sums[index] = '合計'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = currency(values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0), '', 3)
        } else {
          sums[index] = 0
        }
      })
      return sums
    },
    showNumber(row, column) {
      if (column.label === '販売在庫') {
        return currency(row.logicalQuantity, '', 3)
      } else if (column.label === '倉庫在庫') {
        return currency(row.actualQuantity, '', 3)
      } else if (column.label === '賞味期限') {
        if (row.expirationDate === null) { return '' }
        return moment(row.expirationDate).format('YYYY/MM/DD')
      } else if (column.label === '発注日') {
        if (row.orderDate === null) { return '' }
        return moment(row.orderDate).format('YYYY/MM/DD')
      } else if (column.label === '発注数') {
        return currency(row.order, '', 3)
      } else if (column.label === '仕入日付') {
        if (row.purchaseDate === null) { return '' }
        return moment(row.purchaseDate).format('YYYY/MM/DD')
      } else if (column.label === '仕入数量') {
        return currency(row.quantity, '', 3)
      } else if (column.label === '入港日') {
        if (row.eta === null) { return '' }
        return moment(row.eta).format('YYYY/MM/DD')
      } else if (column.label === '通関日') {
        if (row.customsClearanceDate === null) { return '' }
        return moment(row.customsClearanceDate).format('YYYY/MM/DD')
      } else if (column.label === '年月') {
        if (row.detail_date === null) { return '' }
        return moment(row.detail_date).format('YYYY/MM')
      } else if (column.label === '数量') {
        return currency(row.quantity, '', 3)
      } else {
        return ''
      }
    },
    recalc(val) {
      this.makeChartData()
    },
    returnZaikoPlan(data) {
      this.zaikoPlan = data
      if (this.datacollection !== null) {
        var tmp = Enumerable.from(this.datacollection.datasets).where(x => x.label === '在庫予測').singleOrDefault(null)
        if (tmp !== null) {
          for (var i = 0; i < 12; i++) {
            tmp.data[i] = this.zaikoPlan[i + 1]
          }
        }
      }
    },
    editTrend(trend) {
      this.form.id = trend.id
      this.form.targetdate = trend.detail_date
      this.form.comments = trend.comments
      this.form.quantity = trend.quantity
      this.dialogVisible = true
    },
    deleteTrend(trend) {
      this.trendLoadFlg = true
      this.$store.dispatch('delSalesTrends', trend).then((value) => {
        this.$notify.info({ title: '販売動向情報', message: '削除しました。' })
        this.getTrendData()
      }, (reasone) => {
        this.$notify.error({ title: 'Error', message: reasone.message })
        this.trendLoadFlg = false
      })
    },
    newTrend() {
      this.form.id = 0
      this.form.targetdate = moment().toISOString()
      this.form.comments = null
      this.form.quantity = 0
      this.dialogVisible = true
    },
    registTrend() {
      this.trendLoadFlg = true
      this.dialogVisible = false
      let data = {}
      data.id = this.form.id
      data.product_id = this.selectView[0].product.id
      data.detail_date = moment(this.form.targetdate).format('YYYY/MM/DD')
      data.comments = this.form.comments
      data.quantity = this.form.quantity
      data.user_id = this.$store.getters.userId
      this.$store.dispatch('setSalesTrends', data).then((value) => {
        this.$notify.info({ title: '販売動向情報', message: '登録/更新しました。' })
        this.getTrendData()
      }, (reasone) => {
        this.$notify.error({ title: 'Error', message: reasone.message })
        this.trendLoadFlg = false
      })
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
<style lang="scss" scoped>
.box-card-noscroll {
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;
}

.box-card {
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;
  overflow-x: scroll;
}

.subtitle {
  font-size: 14px;
}

$border-color: #E5E9F2; // Light Gray
$title-bgcolor: #D3DCE6; // Gray
$icon-color:#8492A6; // Silver
$hidden-bgcolor:#EFF2F7; // Extra Light Gray
$danger-color:#FF4949;
$warning-color:#F7BA2A;
.text-warning {
  color: $danger-color;
}

.bg-warning {
  background-color: #F7BA2A;
}

.text-danger {
  color: #FF4949;
}

.bg-danger {
  background-color: #FF4949;
}

table.ptable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  line-height: 1.5;
  border-top: 1px solid $border-color;
  border-left: 1px solid $border-color;
}

table.ptable th {
  text-align: center;
  padding: 4px;
  font-weight: bold;
  vertical-align: top;
  border-right: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  border-top: 1px solid $border-color;
  border-left: 1px solid $border-color;
  background: $title-bgcolor;
  font-size: 14px;
  &.title-st {
    width: 4%;
    min-width: 30px;
  }
  &.title-mid {
    width: 6%;
    min-width: 50px;
  }
  &.datacell {
    width: 7%;
    min-width: 60px;
  }
}

.hidden-title {
  background-color: $hidden-bgcolor;
}

table.ptable td {
  text-align: right;
  padding: 4px;
  vertical-align: top;
  border-right: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  font-size: 14px;
}

i {
  margin-left: 8px;
  font-size: 10px;
  color: $icon-color;
}
</style>
