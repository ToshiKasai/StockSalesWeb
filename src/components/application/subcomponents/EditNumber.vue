<template lang="pug">
  div.myedit(@click="onToggle")
    input.showdisp(v-if="!editFlag" v-model="dispval" disabled)
    input.inputter(name="editinput" v-if="editFlag" v-model="showVal"
      type="text" @keypress="keycheck" @focus="onEdit" @blur="offToggle" @change="formatcheck" editinput)
</template>
<script>
import { myIsNaN, numberFormat } from '@/libraries/supports'
export default {
  props: {
    editval: {
      type: Number,
      required: true
    },
    dispflag: {
      type: Boolean,
      default: false
    },
    results: {
      type: Function,
      default: null
    },
    index: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showVal: this.editval,
      editFlag: false,
      onEditFlag: false
    }
  },
  computed: {
    dispval() {
      return numberFormat(this.editval, this.dispflag ? 3 : 0)
    }
  },
  methods: {
    keycheck(event) {
      var m = String.fromCharCode(event.keyCode)
      if ('0123456789.-\b\r'.indexOf(m, 0) < 0) {
        event.returnValue = false
      }
      if (m === '\r') {
        this.offToggle()
      }
    },
    onToggle(e) {
      this.editFlag = true
      setTimeout(() => { if (this.onEditFlag === false) { this.offToggle() } }, 1000)
    },
    onEdit(e) {
      this.onEditFlag = true
    },
    offToggle(e) {
      if (myIsNaN(this.showVal)) {
        this.showVal = 0
      }
      if (this.onEditFlag && this.showVal !== this.editval) {
        if (this.results !== null) {
          if (this.index === null) {
            this.results(this.showVal)
          } else {
            this.results(this.index, this.showVal)
          }
        }
        this.$emit('update:editval', this.showVal)
      }
      this.editFlag = false
      this.onEditFlag = false
    },
    formatcheck(val) {
      if (this.showVal === null) {
        this.showVal = 0
      }
      var tmp = this.showVal.match(/-?[0-9]+\.?[0-9]*/g)
      if (Array.isArray(tmp)) {
        this.showVal = parseFloat(tmp[0])
      } else {
        this.showVal = parseFloat(tmp)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
input[type="text"] {
  width: 100%;
  box-sizing: border-box;
}

.myedit {
  display: block;
  .inputter {
    display: block;
    font-size: 14px;
    text-align: right;
    width: 100%;
  }
  .showdisp {
    margin-top: 2px;
    padding-top: 2px;
    margin-bottom: 2px;
    padding-bottom: 2px;
    border: none;
    display: block;
    color: #000;
    // background-color: #ffffff;
    background-color: transparent;
    text-align: right;
    width: 100%;
  }
}
</style>
