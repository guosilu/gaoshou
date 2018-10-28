const util = require('../../../config/comment.js');
const configLike = require('../../../config/like.js');
const config = util.config;
const comment = util.comment;
const app = util.app;


Page({
  data: {
    like_status: null,
    detail: {},
    // 评论
    // contShow: false,
    // sendShow: true,
    types:'comment',
    inputVal: "",
    comment:"",
  },
  is_like: function (id) {
    var that = this;
    var where = {
      id: this.data.detail.id,
      openId: app.globalData.openId
    }
    configLike.is_like(config.publicationUrl, 'is_like', where).then(function(data){
      that.setData({
        like_status: data
      })
    });
  },
  like: function () {
    var that = this;
    var post = {
      id: this.data.detail.id,
      openId: app.globalData.openId
    };
    configLike.like(config.publicationUrl, 'like', post).then(function (data) {
      if (data.success == 1) {
        that.setData({
          like_status: 1,
          'detail.dianzan': data.dianzan
        })
        wx.showToast({
          icon: 'none',
          title: '点赞成功！'
        });
      }
    });
  },
  like_cancel: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消点赞吗？',
      success: function (confirm) {
        if (confirm.confirm) {
          var where = {
            id: that.data.detail.id,
            openId: app.globalData.openId
          };
          configLike.like(config.publicationUrl, 'like_cancel', where).then(function (data) {
            if (data.success == 1) {
              that.setData({
                like_status: 0,
                'detail.dianzan': data.dianzan
              })
              wx.showToast({
                icon: 'none',
                title: '已取消点赞！'
              });
            }
          });

        } else if (confirm.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },
  //赏金
  reward:function(e){
    var randa = new Date().getTime().toString();
    var randb = Math.round(Math.random() * 10000).toString();
    
    wx.request({
      url: config.payApi,
      dataType:"json",
      method:"post",
      data:{
        action: "unifiedOrder",
        out_trade_no: randa + randb,//商户订单号
        body: "Guosilu 测试", //商品描述
        total_fee: "1", //金额 单位:分
        trade_type: "JSAPI", //交易类型
        openId: app.globalData.openId
      },
      success: function (res) {
        console.log(res.data);
      }
    })



    // wx.requestPayment(
    //   {
    //     'timeStamp': new Date().getTime().toString(),
    //     'nonceStr': Math.round(Math.random() * 10000).toString(),
    //     'package': '',
    //     'signType': 'MD5',
    //     'paySign': '',
    //     'success': function (res) { },
    //     'fail': function (res) { },
    //     'complete': function (res) { }
    //   }) 

  },
  input:function(e){
    var that = this;
    that.setData({
      value: e.detail.value
    })
  },
  // 评论
  inputTyping: function (e) {
    this.setData({
      sendShow: false,
      contShow: true
    })
  },
  sendBtn: function (e) {
    var that = this;
    that.setData({
      contShow: false,
      sendShow: true,
      inputVal: "",
    })
    var param = {};
    param['content'] = that.data.value;
    param['types'] = that.data.types;
    param['compose_type'] = 'publication';
    param['openId'] = app.globalData.openId;
    param['compose_id'] = that.data.detail.id
    
    comment.query('add', param).then(
      function(data){
        console.log(data);
        if(data!='0'){
          wx.showToast({
            title: '添加成功',
          })
        }else{
          wx.showToast({
            title: '添加失败',
            icon: 'none'
          })
        }
        //评论完成更新数据
        var param = {};
        param['compose_id'] = that.data.detail.id;
        comment.query('list', param).then(
          function (data) {
            console.log(data);
            that.setData({
              comment: data
            })
          }
        );  
        
      }
    );    
  },
  // contReply: function (e) {
  //   this.setData({
  //     contShow: true,
  //     sendShow: false,
  //     inputVal: "回复",
  //     types:'reply'
  //   })
  // },
  // 评论End

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.is_like(options.id);
    wx.showLoading({
      mask: true,
      title: '加载中...',
    })
    var that = this;
    let id = '3';
    if (options.id){
      id = options.id;
    }
    wx.request({
      url: config.publicationUrl,
      method: "POST",
      data: {
        action: 'detail',
        id: id
      },
      success: function (res) {
        if (res.data) {
          that.setData({
            detail: res.data
          })
          that.is_like(res.data.id);
          wx.hideLoading();
        }
      },
      // 最后查询评论
      complete:function(){
        var param = {};
        param['compose_id'] = that.data.detail.id;
        // param['page'] = that.data.deatil.id;
        comment.query('list', param).then(
          function (data) {
            console.log(data);
            that.setData({
              comment:data
            })
          }
        );   
      }
    });
    // console.log(comment.getlist(id,'publication'));

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
    console.log("下拉事件.")
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

  }
})