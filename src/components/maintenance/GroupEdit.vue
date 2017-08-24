<template lang="pug">
  div.basemargin
    el-form(:model="group" label-position="right" label-width="150px" :rules="checkRules" ref="groupForm")
      el-form-item(label="コード" prop="code")
        el-input(type="text" v-model="group.code")
      el-form-item(label="グループ名" prop="name")
        el-input(type="text" v-model="group.name")

      el-form-item(label="メーカー" prop="makerModelId")
        el-select(v-model="group.makerModelId")
          el-option(v-for="item in makers" :key="item.id" :label="item.dispname" :value="item.id")

      el-row
        el-col(:span="12")
          el-form-item(label="管理方法")
            el-radio-group(v-model="group.isCapacity")
              el-radio-button(:label="true") 容量
              el-radio-button(:label="false") パレット

        el-col(:span="12")
          el-form-item(label="基本コンテナ")
            el-select(v-model="group.containerModelId")
              el-option(v-for="item in containers" :key="item.id" :label="item.name" :value="item.id")

      el-form-item(label="コンテナ入り数")
        el-row
          el-col(:span="6") ２０ｆｔドライ
          el-col(:span="6") ２０ｆｔリーファ
          el-col(:span="6") ４０ｆｔドライ
          el-col(:span="6") ４０ｆｔリーファ
        el-row
          el-col(:span="6")
            el-input-number(type="text" v-model="group.containerCapacityBt20Dry" :min="0")
          el-col(:span="6")
            el-input-number(type="text" v-model="group.containerCapacityBt20Reefer" :min="0")
          el-col(:span="6")
            el-input-number(type="text" v-model="group.containerCapacityBt40Dry" :min="0")
          el-col(:span="6")
            el-input-number(type="text" v-model="group.containerCapacityBt40Reefer" :min="0")

      el-form-item(label="削除")
        el-switch(v-model="group.deleted" on-text="削除" off-text="")
      el-form-item
        el-button(type="primary" @click="submitForm('groupForm')") 変更
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
      title: 'グループ編集',
      group: {},
      makers: [],
      containers: [],
      checkRules: {
        code: [
          { type: 'string', required: true, message: '入力は必須です', trigger: 'blur' },
          { type: 'string', min: 5, max: 128, message: '桁数が正しくありません', trigger: 'blur' },
          { type: 'string', pattern: /^[a-zA-Z\d]{5,128}$/, message: '不正な書式です', trigger: 'blur' }
        ],
        name: [
          { type: 'string', required: true, message: '入力は必須です', trigger: 'blur' },
          { max: 256, message: '桁数が正しくありません', trigger: 'blur' }
        ],
        makerModelId: [
          { type: 'number', required: true, message: '入力は必須です' }
        ]
      }
    }
  },
  methods: {
    getScreenData() {
      this.$store.dispatch('nowLoadingMainte', 'グループ情報処理中')
      Promise.all([
        this.$store.dispatch('maintenance/getGroup', this.id),
        this.$store.dispatch('maintenance/getMakerList'),
        this.$store.dispatch('maintenance/getContainers')
      ]).then((value) => {
        this.group = makeSingle(value[0].data, 'object')
        this.makers = Enumerable.from(makeArray(value[1].data, 'object')).orderBy(x => x.code)
          .select('x => { id : x.id, dispname : x.code + " : " + x.name }').toArray()
        this.containers = makeArray(value[2].data, 'object')
        this.$store.dispatch('endLoading')
      }, (reasone) => {
        this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message })
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.dispatch('nowLoadingMainte', 'グループ情報更新中')
          this.$store.dispatch('maintenance/setGroup', this.group).then((response) => {
            this.$notify({ title: '変更完了', message: 'グループ情報の更新を行いました' })
            this.$store.dispatch('endLoading')
            this.$router.go(-1)
          }).catch((error) => {
            this.$store.dispatch('endLoading')
            this.$notify.error({ title: 'Error', message: error.message })
          })
        } else {
          return false
        }
      })
    },
    cancel() {
      this.$router.go(-1)
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
