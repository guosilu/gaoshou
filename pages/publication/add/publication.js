const app = getApp();
const config = require('../../../config/config.js');
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
    //活动分类
    activityType: ["类别", "人物", "风景", "实物", "书画", "文化", "技艺", "其他"],
    activityTypeIndex: 0,
    //选择活动类型
    cateName: ["图片", "语音", "视频", "文章"],
    cateActive: 0,
    //图片上传
    files: [],
    files_url: [],
    image: [],
    isRecording: false,
    chooseVoice: 'play',
    // 选择支付方式
    selectPay: false,
    imageNum: 4,
  },



  /**
   * 选择视频
   */
  chooseVideo: function() {
    var that = this;
    var files = [];
    wx.chooseVideo({
      maxDuration: 1000,
      success: function(res) {
        console.log(res);
        that.setData({
          files: files.concat(res.tempFilePath),
          // thumbTempFilePath: res.thumbTempFilePath
        })
        //console.log(that.data.files);
      }
    })

  },

  formSubmit: function(e) {
    console.log(e);
    let post = e.detail.value;
    if (post.introduce == '' || post.title == '' || post.type == '类别') {
      wx.showToast({
        title: '不可为空',
        icon: "none"
      })
      return;
    }
    let that = this;
    let files = this.data.files;
    wx.showLoading({
      mask: true,
      title: '提交中...'
    });

    if (files.length > 0) {
      that.setData({
        post: post,
      })
      that.fileUpload(0, that.data.image);
    } else {
      // this.formSubmitDo(post);
      wx.showToast({
        title: '图片不可为空',
        icon: "none"
      })
      return;
    }
  },
  /**
   * 录制音频 启动
   */
  start: function(e) {
    var that = this;
    console.log(e);
    that.RecorderManager.start({
      duration: 60000, //录音时长 单位ms
      sampleRate: 48000, //采样率
      encodeBitRate: 320000, //编码码率
      frameSize: 1,
    })
    that.setData({
      isRecording: true,
    })
    that.RecorderManager.onFrameRecorded((res) => {
      const {
        frameBuffer
      } = res
      console.log('frameBuffer.byteLength', frameBuffer)
    })
  },
  onFrameRecorded: function() {

  },

  /**
   * 停止录制音频
   */
  stop: function() {
    var that = this;
    that.RecorderManager.stop();
    // that.setData({
    //   chooseVoice: 'start'
    // }) 
    that.RecorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const {
        tempFilePath,
        duration
      } = res
      that.setData({
        files: that.data.files.concat(tempFilePath),
        duration: (duration / 1000).toFixed(), //四舍五入
        isRecording: false,
      })
    })
  },

  /**
   * 播放已上传的音频
   */
  play: function() {
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


  formSubmitDo: function(post) {
    let that = this;
    post['mode'] = 'image'
    if (that.data.cateActive == '1') {
      post['mode'] = 'voice'
    } else if (that.data.cateActive == '2') {
      post['mode'] = 'video'
    } else if (that.data.cateActive == '3') {
      post['mode'] = 'article'
    }

    post['openId'] = app.globalData.openId;

    wx.request({
      url: config.publicationUrl,
      method: 'post',
      data: {
        action: 'add',
        post: post
      },
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        if (res.data > 0) {
          wx.showToast({
            title: '提交成功！正在跳转',
            success: function() {
              setTimeout(function() {
                //如果是参与活动那边跳过来的, 添加成功后再返回
                if (that.data.flag){
                  wx.navigateBack({
                    delta: 1
                  })
                }else{
                  wx.redirectTo({
                    url: '../detail/detail?id=' + res.data + "&cateActive=" + post['mode'],
                  })
                }
              }, 1500)
            }
          });
          that.setData({
            form_reset: '',
            files: [],
            files_url: []
          });

        } else {
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
  fileUpload: function(i, files, flag) {
    i = i ? i : 0;
    var that = this;
    wx.uploadFile({
      url: config.uploadUrl,
      filePath: files[i],
      name: 'file',
      formData: {
        action: 'uploadAll'
      },
      success: function(res) {
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
          
          if (flag) {
            post['file'] = that.data.filePath;
            that.setData({
              files: [],
              filePath: ""
            })
          }else {
            post['image'] = that.data.filePath;
            that.setData({
              filePath: ""
            })
          }

          if (that.data.files.length > 0) {
            that.fileUpload(0, that.data.files, true)
          }else{
            //console.log(post)
            that.formSubmitDo(post);
          }

        } else {
          that.fileUpload(i, files);
        }
      },
      fail: function() {
        wx.showToast({
          title: '上传异常!请稍后再试',
          icon: 'none'
        })
        return;
      }
    });
  },

  bindAccountChange: function(e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);
    if (e.detail.value < 1) {

    }
    this.setData({
      activityTypeIndex: e.detail.value
    })
  },

  // 图片上传
  chooseImage: function(e) {
    var that = this;

    wx.chooseImage({
      count: that.data.imageNum,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        that.setData({
          image: that.data.image.concat(res.tempFilePaths)
        });
      }
    })
  },

  //删除图片
  delImg: function(e) {
    let that = this;
    let id = e.target.dataset.id;
    let files = that.data.image;
    let files_new = [];
    for (var i = 0; i < files.length; i++) {
      if (i != id) {
        files_new.push(files[i]);
      }
    }
    that.setData({
      image: files_new
    })
  },
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.image // 需要预览的图片http链接列表
    })
  },



  /**
   * banner
   */
  getBanner: function() {
    var that = this;
    wx.request({
      url: config.activity_orderUrl,
      method: 'POST',
      data: {
        action: 'getBanner'
      },
      success: function(res) {
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
   * tab切换
   */
  cateClick: function(e) {
    let clk = this;
    var imageNum = 4;
    if (e.currentTarget.dataset.current != 0) {
      imageNum = 1
    }
    clk.setData({
      cateActive: e.currentTarget.dataset.current,
      imageNum: imageNum,
      files: [],
      image: [],
      thumbTempFilePath: ''
    })
  },

  /**
   * 删除视频
   */
  delVideo: function() {
    var that = this;
    that.setData({
      files: []
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if (options.cateActive){
      this.setData({
        flag: options.cateActive
      })
      let msg = "图片";
      if (options.cateActive == 'video'){
        msg = '视频';
      } else if (options.cateActive == 'voice') {
        msg = '语音';
      } else if (options.cateActive == 'active') {
        msg = '文章';
      }
      wx.showToast({
        title: '请选择' + msg + '类',
        icon: 'none'
      })
    }
    this.getBanner();
    this.RecorderManager = wx.getRecorderManager();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      isLogin: wx.getStorageSync('isLogin')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }

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








  //kaishi

  //支付
  //     wx.showModal({
  //       title: '发布活动支付',
  //       content: '确定要支付' + (app.payData.release_money) / 100 + '元吗？',
  //       success: function (sm) {
  //         if (sm.confirm) {
  //           //支付 
  //           var randa = new Date().getTime().toString();
  //           var randb = Math.round(Math.random() * 10000).toString();
  //           var that = this;
  //           wx.request({
  //             url: config.payApi,
  //             dataType: "json",
  //             method: "post",
  //             data: {
  //               action: "unifiedOrder",
  //               out_trade_no: randa + randb, //商户订单号
  //               body: "赛脉平台活动发布", //商品描述
  //               total_fee: app.payData.release_money, //金额 单位:分
  //               trade_type: "JSAPI", //交易类型
  //               openId: app.globalData.openId
  //             },
  //             success: function (res) {
  //               // console.log(res.data);
  //               var data = res.data;
  //               //生成签名
  //               wx.request({
  //                 url: config.payApi,
  //                 dataType: "json",
  //                 method: "post",
  //                 data: {
  //                   "action": "getSign",
  //                   'package': "prepay_id=" + data.prepay_id
  //                 },
  //                 success: function (res) {
  //                   var signData = res.data;
  //                   wx.requestPayment({
  //                     'timeStamp': signData.timeStamp,
  //                     'nonceStr': signData.nonceStr,
  //                     'package': signData.package,
  //                     'signType': "MD5",
  //                     'paySign': signData.sign,
  //                     success: function (res) {
  //                       // 添加数据库信息
  //                       wx.request({
  //                         url: config.activityUrl,
  //                         dataType: "json",
  //                         method: "post",
  //                         data: {
  //                           "action": "add_release",
  //                           "total_fee": app.payData.release_money,
  //                           "user": app.globalData.userInfo.nickName,
  //                           "openid": app.globalData.openId,
  //                           "type": post.type,
  //                         },
  //                         success: function (res1) {
  //                           console.log(res1.data);
  //                           // console.log(res);
  //                           //支付成功
  //                           //sta
  //                           // wx.showLoading({
  //                           //   mask: true,
  //                           //   title: '提交中...',
  //                           // });
  //                           wx.request({
  //                             url: config.publicationUrl,
  //                             method: "POST",
  //                             data: {
  //                               action: 'add',
  //                               post: post,
  //                               release_id: res1.data //发布的id
  //                             },
  //                             success: function (res) {
  //                               console.log(res);
  //                               if (res.data > 0) {
  //                                 wx.showToast({
  //                                   title: '提交成功！',
  //                                 });
  //                                 setTimeout(function () {
  //                                   wx.redirectTo({
  //                                     url: '../detail/detail?id=' + res.data,
  //                                   })
  //                                 }, 1500)
  //                               } else {
  //                                 wx.showToast({
  //                                   title: '提交失败！',
  //                                   icon: 'none'
  //                                 });
  //                               }
  //                             }
  //                           })
  //                           // over
  //                         }
  //                       })
  //                     },
  //                     fail: function (res) {
  //                       wx.showToast({
  //                         title: '支付已取消',
  //                         icon: 'none'
  //                       });
  //                     }
  //                   })
  //                 }
  //               })
  //             }
  //           })
  //         } else if (sm.cancel) {
  //           console.log('用户点击取消');
  //           wx.showToast({
  //             title: '您已取消活动发布',
  //             icon: 'none'
  //           });
  //           return false;
  //         }
  //       }
  //     });


  // // jieshu
  //     return false;

})