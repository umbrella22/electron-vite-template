import axios from 'axios'
import { ElMessage } from 'element-plus'
const serves = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 5000
})

// 设置请求发送之前的拦截器
serves.interceptors.request.use(config => {
  // 设置发送之前数据需要做什么处理
  return config
}, err => Promise.reject(err))

// 设置请求接受拦截器
serves.interceptors.response.use(res => {
  // 设置接受数据之后，做什么处理
  if (res.data.code === 50000) {
    ElMessage.error(res.data.data)
  }
  return res
}, err => {
  // 判断请求异常信息中是否含有超时timeout字符串
  if (err.message.includes('timeout')) {
    console.log('错误回调', err)
    ElMessage.error('网络超时')
  }
  if (err.message.includes('Network Error')) {
    console.log('错误回调', err)
    ElMessage.error('服务端未启动，或网络连接错误')
  }
  return Promise.reject(err)
})

// 将serves抛出去
export default serves
