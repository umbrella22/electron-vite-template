// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
import { dialog, Menu } from "electron";
import type { MenuItemConstructorOptions, MenuItem } from "electron"
import { type, arch, release } from "os";
import { version } from "../../../package.json";

const menu: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
    {
        label: "设置",
        submenu: [
            {
                label: "快速重启",
                accelerator: "F5",
                role: "reload",
            },
            {
                label: "退出",
                accelerator: "CmdOrCtrl+F4",
                role: "close",
            },
        ],
    },
    {
        label: "帮助",
        submenu: [
            {
                label: "关于",
                click: function () {
                    dialog.showMessageBox({
                        title: "关于",
                        type: "info",
                        message: "electron-Vue框架",
                        detail: `版本信息：${version}\n引擎版本：${process.versions.v8
                            }\n当前系统：${type()} ${arch()} ${release()}`,
                        noLink: true,
                        buttons: ["查看github", "确定"],
                    });
                },
            },
        ],
    },
];

export const useMenu = () => {
    const creactMenu = () => {
        if (process.env.NODE_ENV === "development") {
            menu.push({
                label: "开发者设置",
                submenu: [
                    {
                        label: "切换到开发者模式",
                        accelerator: "CmdOrCtrl+I",
                        role: "toggleDevTools",
                    },
                ],
            });
        }
        // 赋予模板
        const menuTemplate = Menu.buildFromTemplate(menu);
        // 加载模板
        Menu.setApplicationMenu(menuTemplate);
    }
    return {
        creactMenu
    }
}