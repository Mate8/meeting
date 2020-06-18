<template>
  <div id="app">
    <router-view v-if="visiable"/>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      visiable: false
    }
  },
  methods: {
    decrypt (data, _, $) {
      const CryptoJS = require('crypto-js')
      // eslint-disable-next-line no-redeclare
      const key = CryptoJS.enc.Utf8.parse(_)
      // eslint-disable-next-line no-redeclare
      const iv = CryptoJS.enc.Utf8.parse($)
      var encryptedHexStr = CryptoJS.enc.Hex.parse(data)
      var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
      var decrypt = CryptoJS.AES.decrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
      return decryptedStr.toString()
    }
  },
  mounted () {
    const name = this.GetEnData()
    this.$http({
      url: (process.env.NODE_ENV === 'production' ? 'https://38.145.205.142' : 'https://172.19.23.157:8085') + `/api/GetBaseUrl/${name}/${this.$store.state.user.ModuleName}`
    }).then((res) => {
      this.CreateHttpSource(this.decrypt(res.data, this.$store.state.user.private_key, this.$store.state.user.Code))
      this.$ws.SetUserType(this.$route.meta.userType)
      this.$ws.Connect(() => {
        this.visiable = true
      })
    })
  }
}
</script>

<style>
*{
  margin: 0px;
  padding: 0px;
}
body,html,#app {
  width: 100%;
  height: 100%;
}
</style>
