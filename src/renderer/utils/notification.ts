interface DesktopMsgProps {
  /** 标题 */
  title: string,
  /** 正文 */
  body: string,
  /** ICON */
  icon?: string
}

/**
 * @export
 * @Author: Sky
 * @Date: 2019-09-29 20:23:16
 * @Last Modified by: Sky
 * @Last Modified time: 2019-09-29 21:01:24
 * @param {DesktopMsgProps} option
 * @returns
 * @feature 对于普通的通知只需要加入传入title,body；而对于需要图标的还需要传入icon，当然它也接受一个图片链接,当用户点击通知之后，会返回一个true
 * 由于是一个promise，请使用then接受
 **/

export function DesktopMsg (option: DesktopMsgProps): Promise<boolean> {
  const msgfunc = new window.Notification(option.title, option)
  return new Promise((resolve) => {
    msgfunc.onclick = () => {
      resolve(true)
    }
  })
}
