const config = require('../../config/config.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    filePath: '',
    isLogin: wx.getStorageSync('isLogin'),
    img: config.img,
    //swiper
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    indicatorColor: "#FFF", //指示点颜色
    indicatorActiveColor: "#22b38a",
    autoplay: true,
    interval: 5000,
    duration: 1000,
    //选择活动类型
    cateName: ["图片", "语音", "视频", "文章"],
    cateActive: 1,
    //活动分类
    activityType: ["作品类别", "人物", "风景", "实物", "书画", "文化", "技艺", "其他"],
    activityTypeIndex: 0,
    //图片上传
    files: [],
    files_url: [],
    form_reset: '',
    activity_id: '',
    //音频 chooseVoice
    vofile: '',
    isRecording: false,
    chooseVoice: 'play',
    //视频  
    vifile: '',
    // 选择支付方式
    selectPay: false,
  },
  formSubmit: function (e) {
    wx.showLoading({
      mask: true,
      title: '提交中...',
    });
    let post = e.detail.value;
    if (post.truename == '' || post.note == '') {
      wx.showToast({
        title: '信息填写不完整！',
        icon: 'none'
      })
      return false;
    }
    let that = this;
    let files = this.data.files;
    if (files.length>0) {
      that.setData({
        post: post
      })
      that.fileUpload(0, files);

    } else {
      wx.showToast({
        title: '至少上传一张作品！',
        icon: 'none'
      })
      return false;
    }
  },/**
     * 录制音频 启动
     */
  start: function (e) {
    var that = this;
    console.log(e);
    that.RecorderManager = wx.getRecorderManager();
    that.RecorderManager.start({
      duration: 60000,       //录音时长 单位ms
      sampleRate: 48000,      //采样率
      encodeBitRate: 320000,   //编码码率
      frameSize: 1,
    })
    that.setData({
      isRecording: true,
    })
    that.RecorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer)
    })
  },
  onFrameRecorded: function () {

  },

  /**
   * 停止录制音频
   */
  stop: function () {
    var that = this;
    that.RecorderManager.stop();
    // that.setData({
    //   chooseVoice: 'start'
    // }) 
    that.RecorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res
      that.setData({
        filePath: tempFilePath,
        isRecording: false,
      })
    })
  },

  /**
   * 播放已上传的音频
   */
  play: function () {
    var that = this;
    that.InnerAudioContext = wx.createInnerAudioContext()
    that.InnerAudioContext.src = that.data.filePath;
    that.InnerAudioContext.play();
    that.InnerAudioContext.onPlay(() => {
      console.log(that.InnerAudioContext)
    })
    that.setData({
      chooseVoice: 'pause',
    })
    that.InnerAudioContext.onEnded(() => {
      that.setData({
        chooseVoice: 'play',
      })
    })
  },
  /**
   * 停止播放已上传的音频
   */
  stopPlay() {
    this.InnerAudioContext.stop();
    that.setData({
      chooseVoice: 'play',
    })
  },
  /**
   * 暂停播放已上传的音频
   */
  pause() {
    this.InnerAudioContext.pause();
    let that = this;
    that.setData({
      chooseVoice: 'play',
    })
  },
  formSubmitDo: function (post) {
    let that = this;
    post['activity_id'] = that.data.activity_id;
    post['openId'] = app.globalData.openId;
    wx.request({
      url: config.activity_orderUrl,
      method: 'post',
      data: {
        action: 'add',
        post: post
      },
      dataType:'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data > 0) {
          wx.showToast({
            title: '提交成功！',
          });
          that.setData({
            form_reset: '',
            files: [],
            files_url: []
          });
          wx.redirectTo({
            url: '../orderDetail/orderDetail?id='+res.data,
          })
        }else{
          wx.showToast({
            title: '提交失败！',
            icon: 'none'
          });
        }
      }
    })
  },
  /**
 * 递归上传文件
 */
  fileUpload: function (i, files) {
    i = i ? i : 0;
    var that = this;
    wx.uploadFile({
      url: config.uploadUrl,
      filePath: files[i],
      name: 'file',
      formData: {
        action: 'upload_file'
      },
      success: function (res) {
        i++;
        if (that.data.filePath == '') {
          that.setData({
            filePath: that.data.filePath.concat(res.data)
          })
        } else {
          that.setData({
            filePath: that.data.filePath.concat(',' + res.data)
          })
        }
        if (i == files.length) {
          let post = that.data.post;
          post['file'] = that.data.filePath;
          that.formSubmitDo(post);
        } else {
          that.fileUpload(i, files);
        }
      },
      fail: function () {
        wx.showToast({
          title: '上传异常!请稍后再试',
          icon: 'none'
        })
        return;
      }
    });
  },

  bindAccountChange: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);
    if (e.detail.value < 1) {

    }
    this.setData({
      activityTypeIndex: e.detail.value
    })
  },
  bindAccountChange: function (e) {
    var that = this;
    console.log('picker account 发生选择改变，携带值为', e.detail.value);
    if (e.detail.value < 1) {
 
    }
    that.setData({
      activityTypeIndex: e.detail.value
    })
  },
  //删除图片
  delImg: function (e) {
    let that = this;
    let id = e.target.dataset.id;
    let files = that.data.files;
    let files_new = [];
    for (var i = 0; i < files.length; i++) {
      if (i != id) {
        files_new.push(files[i]);
      }
    }
    that.setData({
      files: files_new
    })
  },
  // 图片上传
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    var that = this;
    that.getBanner();
    console.log(options);
    if (Object.keys(options).length==0){
      wx.showToast({
        title: '跳转异常!正在返回!',
        icon:"none",
        success:function(){
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }else{
      that.Jurisdiction(options.id)
    }
    
  },
  /**
   * 首页banner图
   * setData : imgUrls
   */
  getBanner: function () {
    var that = this;
    wx.request({
      url: config.activity_orderUrl,
      method: 'POST',
      data: {
        action: 'getBanner'
      },
      success: function (res) {
        var result = res.data;
        for (let a = 0; a < result.length; a++) {
          if (result[a]['file'] && result[a]['mode'] == 'image') {
            result[a]['file'] = result[a]['file'].split(',');
          }
        }
        console.log(result);
        that.setData({
          imgUrls: result,
        });
      }
    })
  },

  /**
   * check Jurisdiction
   */
  Jurisdiction: function (id){
    var that = this;
    wx.request({
      url: config.activityUrl,
      method: "POST",
      data: {
        action: 'is_join',
        post: {
          id: id,
          openId: app.globalData.openId
        }
      },
      success: function (res) {
        if (res.data == 1) {

          that.setData({
            activity_id: options.id
          });
        } else if (res.data == 2) {
          wx.showToast({
            icon: 'none',
            title: '您不能参加自己发布的活动！',
            success: function () {
              that.goBack();
            }
          });
        } else if (res.data == 3) {
          wx.showToast({
            icon: 'none',
            title: '您已经参加！',
            success: function () {
              that.goBack();
            }
          });
        } else if (res.data == 4) {
          wx.showToast({
            icon: 'none',
            title: '活动已经开始！',
            success: function () {
              that.goBack();
            }
          });
        }
      }
    });
  },

  /**
   * 返回上一层
   */
  goBack: function (){
    setTimeout(function () {
      wx.navigateBack({
        delta: 1
      })
    }, 1500)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isLogin: wx.getStorageSync('isLogin')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // uploadFile: function (path, post) {
  //   let that = this;
  //   wx.uploadFile({
  //     url: config.uploadUrl,
  //     filePath: path,
  //     name: 'file',
  //     formData: {
  //       action: 'upload_file'
  //     },
  //     success(res) {
  //       console.log(res);
  //       that.setData({
  //         files_url: that.data.files_url.concat(res.data)
  //       });
  //       let files_url = that.data.files_url
  //       let files = that.data.files
  //       if (files_url.length == files.length) {
  //         for (let i = 0; i < files_url.length; i++) {
  //           let k = i;
  //           if (k == 0) k = '';
  //           post['thumb' + k] = files_url[i];
  //         }
  //         that.formSubmitDo(post);
  //       }
  //     }
  //   })
  // },
})