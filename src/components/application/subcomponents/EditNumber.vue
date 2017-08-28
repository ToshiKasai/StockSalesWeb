<template lang="pug">
  div(@click="onToggle")
    span(v-show="!editFlag") {{editval | currency('',dispflag?3:0)}}
    input.inputter(name="editinput" v-show="editFlag" v-model="showVal"
      type="text" @keypress="keycheck" @focus="onEdit" @blur="offToggle" @change="formatcheck" editinput)
</template>
<script>
import { myIsNaN } from '@/libraries/supports'
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
  methods: {
    keycheck(event) {
      var m = String.fromCharCode(event.keyCode)
      if ('0123456789.-\b\r'.indexOf(m, 0) < 0) {
        event.returnValue = false
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
.inputter {
  font-size: 14px;
  width: 100%;
}
</style>
