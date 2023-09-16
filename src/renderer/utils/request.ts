import axios from "axios";
const serves = axios.create({
  baseURL: __CONFIG__.BASE_API,
  timeout: 5000,
});

// 设置请求发送之前的拦截器
serves.interceptors.request.use(
  (config) => {
    // 设置发送之前数据需要做什么处理
    return config;
  },
  (err) => Promise.reject(err)
);

// 设置请求接受拦截器
serves.interceptors.response.use(
  (res) => {
    // 设置接受数据之后，做什么处理
    if (res.data.code === 50000) {
      // ElMessage.error(res.data.data);
    }
    return res;
  },
  (err) => {
    // 判断请求异常信息中是否含有超时timeout字符串
    if (err.message.includes("timeout")) {
      console.log("错误回调", err);
    }
    if (err.message.includes("Network Error")) {
      console.log("错误回调", err);
    }
    return Promise.reject(err);
  }
);

// 将serves抛出去
export default serves;
