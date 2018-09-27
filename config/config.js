
// 定义常量
const baseUrl = 'https://aa.zdcom.net.cn/';
const loginUrl = baseUrl + 'gaoshou/api/loginApi.php';
const uploadUrl = baseUrl + 'gaoshou/api/uploadApi.php';
const coreUrl = baseUrl + "gaoshou/core/";
const img = baseUrl + "gaoshou/images/";


// 对外接口
module.exports = {
  loginUrl: loginUrl,
  uploadUrl: uploadUrl,
  coreUrl: coreUrl,
  img: img
}