const util = require('../../../../config/comment.js');
const config = util.config;
const app = util.app;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  formSubmit: function(param){
    
    var param = param.detail.value;
    console.log(param);
    return;
    wx.request({
      url: config.forum,
      dataType: "json",
      method: "post",
      data: {
        "action": "addQuestion",
        "param":{
          title: param.title,
          introduce: param.introduce,
          openId: app.globalData.openId,
          image: image,
          state: '3'
        }
      },
      success: function (res) {
        console.log(res);
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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