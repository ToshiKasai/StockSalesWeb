<template lang="pug">
  div
    el-upload.myUpload(:action="actionUrl"
      :headers="headers" drag :accept="mineType"
      :before-upload="beforeAvatarUpload"
      :file-list="fileList" :auto-upload="true"
      :on-success="uploadsuccess" :on-error="uploadfail")
      i.el-icon-upload
      .el-upload__text ファイルをドラッグするか
        em クリックしてファイルを選択してください。
      .el-upload__tip(slot="tip") xls/xlsx ファイルのみで、500kb以下のみ対応
</template>
<script>
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: '予算アップロード',
      mineType: 'application/excel,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileList: []
    }
  },
  computed: {
    actionUrl() {
      return this.$http.defaults.baseURL + 'api/salesviews/upload'
    },
    headers() {
      return {
        'Authorization': 'bearer ' + this.$ls.get('bearer', '')
      }
    }
  },
  methods: {
    beforeAvatarUpload(file) {
      const isFiletype = (file.type === 'application/excel' || file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      // const isLt2M = file.size / 1024 / 1024 < 2
      const isSizeOver = file.size / 1024 < 500
      if (!isFiletype) {
        this.$notify.error({ title: 'アップロード前エラー', message: 'アップロードできるファイル形式ではありません' })
      }
      if (!isSizeOver) {
        this.$nextTick(() => {
          this.$notify.error({ title: 'アップロード前エラー', message: 'アップロードできるファイルサイズを超えています' })
        })
      }
      return isFiletype && isSizeOver
    },
    uploadsuccess(response, file, fileList) {
      this.$nextTick(() => {
        this.$notify.success({ title: '予算登録完了', message: file.name + 'の処理が完了しました' })
      })
    },
    uploadfail(err, file, fileList) {
      if (err) { }
      this.$nextTick(() => {
        this.$notify.error({ title: '予算登録エラー', message: err.message })
      })
    }
  },
  created() {
  },
  watch: {
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
<style lang="scss" scoped>
.myUpload {
  width: 100%;
}
</style>
