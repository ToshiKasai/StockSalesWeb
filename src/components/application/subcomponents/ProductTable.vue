<template lang="pug">
  div
    div {{data.product.code}} : {{data.product.name}}
    .subtitle ({{data.product.isSoldWeight?'計量品':'ピース品'}}／ケース：{{data.product.quantity}}／パレット：{{data.product.paletteQuantity | placeholder('未登録')}}／リードタイム：{{data.product.leadTime | placeholder('未登録')}})
    el-button(@click="doSave(data)" v-bind="{disabled : saveFlag}" :loading="saveFlag") 保存
    el-button(v-if="!detailMode" @click="goDetail(data.product)") 詳細表示
    span.button_margin(v-if="nosaveFlag")
      i.save_warning.material-icons &#xE002;
      |未保存の状態です
    table.ptable(border="0")
      tr
        th(colspan="2") -
        el-tooltip.item(v-for="o in 12" :key="o" effect="dark" :content="dataFormat(data.salesList[o].detail_date)" placement="top")
          // th.datacell {{ (o + 8) % 12 + 1 }}月
          th.detacell {{data.salesList[o].detail_date | converetDateFormat("M月")}}

      tr
        th.title-st(rowspan="2") 月初<br>在庫
        el-tooltip.item(effect="dark" content="在庫数と入荷や販売情報より算出" placement="top")
          th.title-mid 予測
        td.datacell(v-for="o in 12" :key="o" :class="{'text-danger':zaikoPlan[o]<0}") {{zaikoPlan[o] | currency('',data.product.isSoldWeight?3:0)}}
      tr
        el-tooltip.item(effect="dark" content="月初時の在庫" placement="top")
          th.title-mid 実績
        td(v-for="o in 12" :key="o") {{data.salesList[o].zaiko_actual | currency('',data.product.isSoldWeight?3:0)}}

      tr
        th.title-st(rowspan="2") 発注
        th.title-mid 予定
          i.table_icon.el-icon-edit
        td(v-for="o in 12" :key="o")
          edit-number(:editval.sync="data.salesList[o].order_plan" :dispflag="data.product.isSoldWeight" :index="o" :results="recalcOrder")
      tr
        th.title-mid 実績
        td(v-for="o in 12" :key="o") {{data.salesList[o].order_actual | currency('',data.product.isSoldWeight?3:0)}}

      tr
        th.title-st(:rowspan="invoiceFlag?5:3") 入荷
        th.title-mid 予定
          i.table_icon.el-icon-edit
        td(v-for="o in 12" :key="o")
          edit-number(:editval.sync="data.salesList[o].invoice_plan" :dispflag="data.product.isSoldWeight" :results="recalc")
      tr
        th.title-mid 実績
        td(v-for="o in 12" :key="o") {{data.salesList[o].invoice_actual | currency('',data.product.isSoldWeight?3:0)}}
      tr
        th.title-mid(@click="toggleInvoice") 残数
          i.table_icon.el-icon-arrow-down(:class="{'el-icon-arrow-up':invoiceFlag}")
        td(v-for="o in 12" :key="o") {{data.salesList[o].invoice_zan - data.salesList[o].invoice_adjust | currency('',data.product.isSoldWeight?3:0)}}
      tr.hidden-title(v-show="invoiceFlag")
        th.title-mid 残数
        td(v-for="o in 12" :key="o") {{data.salesList[o].invoice_zan | currency('',data.product.isSoldWeight?3:0)}}
      tr.hidden-title(v-show="invoiceFlag")
        th.title-mid 調整
          i.table_icon.el-icon-edit
        td(v-for="o in 12" :key="o" :class="{'text-danger':data.salesList[o].invoice_adjust<0}")
          edit-number(:editval.sync="data.salesList[o].invoice_adjust" :dispflag="data.product.isSoldWeight" :results="recalc")
      tr
        th.title-st(:rowspan="salesRow") 販売
        th.title-mid 前年
        td(v-for="o in 12" :key="o") {{data.salesList[o].pre_sales_actual | currency('',data.product.isSoldWeight?3:0)}}
      tr
        th.title-mid 予算
          i.table_icon.el-icon-edit
        td(v-for="o in 12" :key="o")
          edit-number(:editval.sync="data.salesList[o].sales_plan" :dispflag="data.product.isSoldWeight" :results="recalc")
      tr
        th.title-mid 動向
        td(v-for="o in 12" :key="o") {{data.salesList[o].sales_trend | currency('',data.product.isSoldWeight?3:0)}}
      tr
        th.title-mid(@click="toggleSales") 実績
          i.table_icon.el-icon-arrow-down(:class="{'el-icon-arrow-up':officesFlag}")
        td(v-for="o in 12" :key="o") {{data.salesList[o].sales_actual | currency('',data.product.isSoldWeight?3:0)}}

      tr.hidden-title(v-for="office in data.officeSales" v-show="officesFlag")
        th.title-mid {{office[1].office_name}}
        td(v-for="o in 12" :key="o") {{office[o].sales_actual | currency('',data.product.isSoldWeight?3:0)}}

      tr
        th.title-mid 前年比
        td(v-for="o in 12" :key="o") {{percentage(data.salesList[o].sales_actual,data.salesList[o].pre_sales_actual) | currency('',1)}}
      tr
        th.title-mid 予実比
        td(v-for="o in 12" :key="o") {{percentage(data.salesList[o].sales_actual,data.salesList[o].sales_plan+data.salesList[o].sales_trend) | currency('',1)}}
</template>
<script>
import moment from 'moment'
import EditNumber from './EditNumber.vue'
export default {
  props: {
    showData: {
      type: Object,
      required: true
    },
    detailMode: {
      type: Boolean,
      default: false
    },
    results: {
      type: Function,
      default: null
    },
    refZaikoPlan: {
      type: Function,
      default: null
    }
  },
  components: { EditNumber },
  data() {
    return {
      data: this.showData,
      invoiceFlag: false,
      officesFlag: false,
      salesRow: 6,
      zaikoPlan: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      saveFlag: false,
      nosaveFlag: false
    }
  },
  mounted() {
    this.calcInvoiceZan()
    this.calcZaikoPlan()
  },
  methods: {
    dataFormat(value) {
      var tmp = moment(value)
      var form = 'YYYY年M月'
      return tmp.format(form)
    },
    percentage(param1, param2) {
      if (param2 === 0) {
        return 0
      } else {
        return param1 / param2 * 100
      }
    },
    recalcOrder(index, val) {
      if (this.data.product.leadTime !== null) {
        if (index + this.data.product.leadTime <= 12) {
          this.data.salesList[index + this.data.product.leadTime].invoice_plan = val
        }
      }
      this.recalc(val)
    },
    recalc(val) {
      this.nosaveFlag = true
      this.calcInvoiceZan()
      this.calcZaikoPlan()
      if (this.results !== null) {
        this.results(this.data)
      }
      this.$emit('update:editval', this.data)
    },
    calcInvoiceZan() {
      // インボイス残を計算
      for (let i = 1; i < 13; i++) {
        this.data.salesList[i].invoice_zan = (this.data.salesList[i - 1].invoice_zan - this.data.salesList[i - 1].invoice_adjust) + this.data.salesList[i].invoice_plan - this.data.salesList[i].invoice_actual
      }
    },
    calcZaikoPlan() {
      let now = new Date()
      this.zaikoPlan = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

      for (var i = 0; i < 13; i++) {
        if (i === 0) {
          this.zaikoPlan[i] = 0
        } else if (i === 1) {
          this.zaikoPlan[i] = this.data.salesList[1].zaiko_actual
        } else {
          var test = new Date(this.data.salesList[i - 1].detail_date)
          if (test <= now) {
            this.zaikoPlan[i] = this.data.salesList[i - 1].zaiko_actual
          } else {
            this.zaikoPlan[i] = this.zaikoPlan[i - 1]
          }
          // 販売数(予定で計算)
          this.zaikoPlan[i] -= (this.data.salesList[i - 1].sales_plan + this.data.salesList[i - 1].sales_trend)
          // 入荷数(予定と残数で計算)
          this.zaikoPlan[i] += (this.data.salesList[i - 1].invoice_plan + this.data.salesList[i - 2].invoice_zan - this.data.salesList[i - 2].invoice_adjust)
        }
      }
      if (this.refZaikoPlan !== null) {
        this.refZaikoPlan(this.zaikoPlan)
      }
    },
    toggleInvoice() {
      this.invoiceFlag = this.invoiceFlag === false
    },
    toggleSales() {
      this.officesFlag = this.officesFlag === false
      this.salesRow = this.officesFlag ? this.data.officeSales.length + 6 : 6
    },
    goDetail(product) {
      this.$SmoothScroll(0, 1000)
      this.$router.push({ name: 'salesdetail', params: { id: product.id } })
    },
    doSave(data) {
      this.saveFlag = true
      // this.$store.dispatch('nowLoading', 'データ登録中')
      this.$store.dispatch('setSalesview', data).then((value) => {
        // this.$store.dispatch('endLoading')
        this.$notify.info({ title: data.product.name, message: '保存完了しました。' })
        this.saveFlag = false
        this.nosaveFlag = false
      }, (reasone) => {
        // this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message })
        this.saveFlag = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.item {
  margin: 4px;
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
  color: $icon-color;
  &.save_warning {
    font-size: 16px;
  }
  &.table_icon {
    margin-left: 8px;
    font-size: 10px;
  }
}

.button_margin{
  margin-left: 10px;
}
</style>
