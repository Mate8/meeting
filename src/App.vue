<template>
  <div id="app">
    <audio src="//172.19.26.244:8090/api/GetAudio/6a50edd22dbf9684ac89676bde079522" autoplay loop controls />
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
      url: `//127.0.0.1:8091/api/GetBaseUrl/${name}/${this.$store.state.user.ModuleName}`
    }).then((res) => {
      this.CreateHttpSource(this.decrypt(res.data, this.$store.state.user.private_key, this.$store.state.user.Code))
      this.visiable = true
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
