<template lang="pug">
  div
    el-upload.upload-demo(action="https://jsonplaceholder.typicode.com/posts/"
      :headers="{}" drag :accept="mineType" :file-list="fileList" :auto-upload="true")
      i.el-icon-upload
      .el-upload__text Drop file here or
        em click to upload
      .el-upload__tip(slot="tip") jpg/png files with a size less than 500kb
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
  },
  methods: {
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
