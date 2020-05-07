const axios = require('axios')

//
CreateHttp.prototype.$http = null

// 请求地址集合
CreateHttp.prototype.RequestPath = null

// 创建一个新的axios默认实例
CreateHttp.prototype.CreateNewRequest = function () {
  return axios.create()
}

// 获取远端文件
CreateHttp.prototype.GetRemoteFile = function (path) {
  path = this.GetURL(path)
  return this.$http({
    method: 'get',
    url: path,
    responseType: 'stream'
  })
}

CreateHttp.prototype.GetURL = function (path) {
  if (this.RequestPath) {
    let url = ''
    path.split(':').forEach((item) => {
      url = typeof url === 'object' ? url[item] : this.RequestPath[item]
    })
    return url
  }
  return null
}

//
CreateHttp.prototype.GET = function (path, query, headers) {
  path = this.GetURL(path)
  return this.$http({
    url: path,
    method: 'GET',
    params: query,
    headers: headers
  })
}

CreateHttp.prototype.POST = function (path, data, query, headers) {
  path = this.GetURL(path)
  for (const item in headers) {
    if (item.toLowerCase() === 'content-type' && headers[item].indexOf('application/form-data') > -1) {
      if (data) {
        let result = ''
        for (const item in data) {
          result = window.encodeURIComponent(item + '=' + data[item] + '&')
        }
        data = result.slice(0, -1)
      }
    }
  }
  return this.$http({
    url: path,
    method: 'POST',
    params: query,
    data: data,
    headers: headers
  })
}

CreateHttp.prototype.SetRequestInter = function (method) {
  this.$http.interceptors.request.use(method)
}

CreateHttp.prototype.SetResponeInter = function (method) {
  this.$http.interceptors.response.use(method)
}

CreateHttp.prototype.ReloadRequestPath = function (paths, flag) {
  if (flag) {
    for (const item in paths) {
      if (!paths[item]) {
        delete this.RequestPath[item]
        continue
      }
      this.RequestPath[item] = paths[item]
    }
  } else {
    this.RequestPath = paths
  }
}

export default function CreateHttp (baseurl, RequestPath) {
  this.RequestPath = RequestPath
  this.$http = axios.create({
    baseURL: baseurl,
    withCredentials: true
  })
}
