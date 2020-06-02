// 源WebSocket
WebChannel.prototype.SourceSocket = null

// 断线重连标志位
WebChannel.prototype.ReconnectFlag = false

// 正在重连提示
WebChannel.prototype.HasConnecting = false

// 连接地址
WebChannel.prototype.ConnectURL = ''

// 消息队列
WebChannel.prototype.MessageQueue = null

// 事件对象
WebChannel.prototype.EventQueue = null

// 模块名称
WebChannel.prototype.ModuleName = null

// 模块担当角色类型
WebChannel.prototype.UserType = null

// 发送消息
WebChannel.prototype.SendMessage = function (msg) {
  if (this.HasConnecting || this.MessageQueue.length > 0) {
    this.MessageQueue.push(msg)
    return
  }
  msg.ModuleName = this.ModuleName
  msg.type = this.UserType
  this.SourceSocket.send(typeof msg === 'object' ? JSON.stringify(msg) : msg)
}

// 设置模块担当角色类型
WebChannel.prototype.SetUserType = function (type) {
  this.UserType = type
}

// 方法工厂
WebChannel.prototype.CreateFactory = function (method, nextmethod) {
  return (event) => {
    // eslint-disable-next-line promise/param-names
    new Promise((reslove) => {
      method(event, reslove)
    }).then((params) => {
      nextmethod(event, params)
    })
  }
}

// 计算函数
WebChannel.prototype.ComputFunction = function (name) {
  // eslint-disable-next-line camelcase
  const reverse_array = this.EventQueue[name].methods.slice()
  reverse_array.reverse()
  let _fn = this.CreateFactory(reverse_array[0], null)
  for (let i = 1; i < reverse_array.length; i++) {
    _fn = this.CreateFactory(reverse_array[i], _fn)
  }
  this.EventQueue[name].ComputFunction = _fn
}

// 创建事件
WebChannel.prototype.CreateEvent = function (name, ...method) {
  this.EventQueue[name] = {
    methods: [...method],
    ComputMethod: null
  }
  this.ComputFunction(name)
}

// 删除事件方法
WebChannel.prototype.RemoveEvent = function () {
  if (typeof arguments[1] === 'function') {
    this.EventQueue[arguments[0]].methods.splice(this.EventQueue[arguments[0]].methods.findIndex((item) => { return item === arguments[1] }), 1)
  } else if (arguments[1].constructor.prototype.constructor.name === 'Array') {
    arguments[1].forEach((fn) => {
      this.EventQueue[arguments[0]].methods.splice(this.EventQueue[arguments[0]].methods.findIndex((item) => { return item === fn }), 1)
    })
  }
  this.ComputFunction(arguments[0])
  return this
}

// 绑定事件
WebChannel.prototype.BindEvent = function (callback) {
  this.SourceSocket.addEventListener('error', () => {
    if (this.ReconnectFlag && !this.HasConnecting) {
      this.HasConnecting = true
      this.Connect()
    }
    this.HasConnecting = false
  })
  this.SourceSocket.addEventListener('open', (e) => {
    if (this.SourceSocket.readyState === 1) {
      console.warn('连接成功')
      callback(e)
      // 调用连接成功钩子
      if (this.EventQueue.open) {
        this.EventQueue.open.ComputFunction(e)
      }
      // 开启异步推送
      // eslint-disable-next-line promise/param-names
      new Promise((reslove) => {
        this.MessageQueue.forEach((item) => {
          this.SourceSocket.send(typeof item === 'object' ? JSON.stringify(item) : item)
        })
        reslove()
      }).then(() => {
        this.HasConnecting = false
      })
      this.SourceSocket.addEventListener('message', (e) => {
        if (this.EventQueue[JSON.parse(e.data).type]) {
          this.EventQueue[JSON.parse(e.data).type].ComputFunction(e)
        }
      })
      this.SourceSocket.addEventListener('close', (e) => {
        if (this.ReconnectFlag && !this.HasConnecting) {
          this.HasConnecting = true
          this.Connect()
        }
        this.HasConnecting = false
        // 调用关闭钩子
        if (this.EventQueue.close) {
          this.EventQueue.close.ComputFunction(e)
        }
      })
    }
  })
}

// 关闭WebSocket
WebChannel.prototype.Close = function () {
  this.ReconnectFlag = false
  this.SourceSocket.close()
}

// 尝试连接方法
WebChannel.prototype.Connect = function (callback) {
  this.SourceSocket = new WebSocket(this.ConnectURL)
  this.SourceSocket.binaryType = 'arraybuffer'
  this.BindEvent(callback)
}

// 初始化WebSocket
WebChannel.prototype.Init = function (url, modulename, flag) {
  this.ReconnectFlag = flag
  this.ModuleName = modulename
  this.ConnectURL = url
  this.MessageQueue = []
  this.EventQueue = {}
}

function WebChannel (url, modulename, flag = true) {
  this.Init(url, modulename, flag)
}

export default WebChannel
