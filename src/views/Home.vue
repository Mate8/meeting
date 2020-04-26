<template>
  <div>
    <button @click="getData">发送请求</button>
  </div>
</template>

<script>
export default {
  methods: {
    getData () {
      this.$http.POST('System:GetData').then((res) => {
        console.log(res.data)
      })
    }
  },
  mounted () {

  }
}
</script>
