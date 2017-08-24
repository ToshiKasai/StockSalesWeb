import VueCharts from 'vue-chartjs/dist/vue-chartjs.js'
// import { Line, mixins } from 'vue-chartjs/dist/vue-chartjs.js'
const { reactiveProp } = VueCharts.mixins

export default VueCharts.Line.extend({
  mixins: [reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options)
  }
})
