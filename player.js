// player.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 播放类型：audio、video
    type: {
      value: '',
      type: String,
    },
    // 播放地址
    url: {
      value: '',
      type: String
    },
    // 快进进度
    seek: {
      value: 0,
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: wx.getSystemInfoSync().screenHeight,
    width: wx.getSystemInfoSync().screenWidth,
    // 正在播放
    isPlaying: false,
    // 播放完成
    playFinish: false,
    // 是否快进
    isSeek: false,
    // 当前时间
    currentTime: 0.0,
    currentTimeDate: 0,
    // 总时长
    totalTime: 0.0,
    totalTimeDate: 0,
  },

  attached: function(option) {
    this.innerPlayer()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 播放完成
     */
    playFinish: function() {
      // 播放完成
      if (this.data.currentTimeDate == this.data.totalTimeDate) {
        if (this.data.type == 'audio') {
          InnerAudioContext.stop()
        }
      }
    },

    /**
     * 音频播放器
     * 设置播放开始时间
     * id只能使用myAudio、myVideo，不能自定义
     * 系统音频播放器已停止维护，太多坑
     */
    innerPlayer: function() {
      var that = this
      InnerAudioContext = wx.createInnerAudioContext()
      InnerAudioContext.src = this.data.url
      InnerAudioContext.play()

      // 播放进度
      InnerAudioContext.onTimeUpdate(function() {
        var cur = InnerAudioContext.currentTime
        var dur = InnerAudioContext.duration
        if (cur != 0 && dur != 0) {
          that.data.currentTime = cur
          that.data.totalTime = dur
          cur = date.secondToDate(cur)
          dur = date.secondToDate(dur)
          that.setData({
            currentTimeDate: cur,
            totalTimeDate: dur
          })
        }

        that.playFinish()
      })
      // 缓冲中
      InnerAudioContext.onWaiting(function() {
        wx.showLoading({
          title: '加载中',
        })
      })

      // 开始播放
      InnerAudioContext.onPlay(function() {
        that.setData({
          isPlaying: true
        })
        wx.hideLoading()
        console.log('isSeek', that.data.isSeek)

        if (!that.data.isSeek) {
          var dur = InnerAudioContext.duration
          console.log(dur, 'dur')
          that.data.isSeek = true
          InnerAudioContext.seek(that.data.seek)
        }

        console.log('onPlay已播放')
      })

      // 暂停
      InnerAudioContext.onPause(function() {
        that.setData({
          isPlaying: false
        })
        console.log('onPause已暂停')
      })

      // 停止
      InnerAudioContext.onStop(function() {
        that.setData({
          isPlaying: false
        })
      })

      // 错误
      InnerAudioContext.onError(function(res) {
        console.log('播放错误：', res)
      })
    },

    /**
     * 手势播放，iOS真机audio系统默认播放不调用，需配合手势bindTap
     */
    playClick: function(e) {
      this.setData({
        isPlaying: !this.data.isPlaying,
      })
      if (this.data.isPlaying) {
        InnerAudioContext.play()
      } else {
        InnerAudioContext.pause()
      }
    },

    /**
     * 播放-音频iOS不能调用，暂停使用
     */
    playerPlay: function(e) {},

    /**
     * 暂停-音频iOS不能调用，暂停使用
     */
    playerPause: function(e) {},

    /**
     * 播放进度-音频iOS不能调用，暂停使用
     */
    playerTimeUpdate: function(e) {
      this.data.currentTime = e.detail.currentTime
      this.data.totalTime = e.detail.duration
      this.setData({
        currentTimeDate: date.secondToDate(e.detail.currentTime),
        totalTimeDate: date.secondToDate(e.detail.duration)
      })
      this.playFinish()
    },

    playerError: function(e) {
      console.log(e)
    },
  }
})