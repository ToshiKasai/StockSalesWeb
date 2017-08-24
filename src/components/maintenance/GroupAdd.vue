<template lang="pug">
  div.basemargin
    el-form(:model="group" label-position="right" label-width="150px" :rules="checkRules" ref="groupForm")
      el-form-item(label="コード" prop="code")
        el-input(type="text" v-model="group.code")
      el-form-item(label="グループ名" prop="name")
        el-input(type="text" v-model="group.name")

      el-form-item(label="メーカー" prop="makerModelId")
        el-select(v-model="group.makerModelId" placeholder="メーカー選択")
          el-option(v-for="maker in makers" :key="maker.id" :label="maker.dispname" :value="maker.id")

      el-row
        el-col(:span="12")
          el-form-item(label="管理方法")
            el-radio-group(v-model="group.isCapacity")
              el-radio-button(:label="true") 容量
              el-radio-button(:label="false") パレット

        el-col(:span="12")
          el-form-item(label="基本コンテナ")
            el-select(v-model="group.containerModelId")
              el-option(v-for="container in containers" :key="container.id" :label="container.name" :value="container.id")

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
      el-form-item
        el-button(type="primary" @click="submitForm('groupForm')") 登録
        el-button(@click="cancel") キャンセル
</template>
<script>
import Enumerable from 'linq'
import { makeArray } from '@/libraries/supports'
export default {
  props: ['id'],
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'グループ登録',
      group: {
        id: 0,
        code: null,
        name: null,
        makerModelId: null,
        containerModelId: 1,
        containerCapacityBt20Dry: 0,
        containerCapacityBt20Reefer: 0,
        containerCapacityBt40Dry: 0,
        containerCapacityBt40Reefer: 0,
        isCapacity: false,
        deleted: false
      },
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
        this.$store.dispatch('maintenance/getMakerList'),
        this.$store.dispatch('maintenance/getContainers')
      ]).then((value) => {
        this.makers = Enumerable.from(makeArray(value[0].data, 'object')).orderBy(x => x.code)
          .select('x => { id : x.id, dispname : x.code + " : " + x.name }').toArray()
        this.containers = makeArray(value[1].data, 'object')
        this.$store.dispatch('endLoading')
      }, (reasone) => {
        this.$store.dispatch('endLoading')
        this.$notify.error({ title: 'Error', message: reasone.message, trigger: 'change' })
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.dispatch('nowLoadingMainte', 'グループ情報登録中')
          this.$store.dispatch('maintenance/addGroup', this.group).then((response) => {
            this.$notify({ title: '変更完了', message: 'グループ情報の登録を行いました' })
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
