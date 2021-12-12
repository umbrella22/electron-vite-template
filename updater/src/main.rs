// 关闭window子系统
#![windows_subsystem = "windows"]
use druid::debug_state::DebugState;
use druid::widget::prelude::*;
use druid::widget::Flex;
use druid::Application;
use druid::{
    theme, AppLauncher, Color, Data, Lens, LinearGradient, Point, Rect, UnitPoint, WidgetExt,
    WindowDesc,
};
use std::env;
use std::ffi::OsString;
use std::fs;
use std::path::Path;
use std::process;
use std::thread;
#[macro_use]
extern crate serde_derive;

use std::time::Duration;
// #[cfg(any(windows))]
// use std::os::windows::prelude::FileExt;
// #[cfg(any(windows))]
// fn read_at(file: &mut File, buffer: &mut [u8], offset: u64) -> Result<usize, std::io::Error> {
//     file.seek_read(buffer, offset)
// }

use sysinfo::{ProcessExt, Signal, System, SystemExt};

// #[cfg(any(unix))]
// use std::os::unix::prelude::FileExt;
// #[cfg(any(unix))]
// fn read_at(file: &mut File, buffer: &mut [u8], offset: u64) -> Result<usize, std::io::Error> {
//     file.read_at(buffer, offset)
// }
#[derive(Serialize, Deserialize, Debug)]
struct FileHashAndPath {
    file_path: String,
    hash: String,
}
extern crate serde;
extern crate serde_json;
#[derive(Serialize, Deserialize, Debug)]
struct UpdateConfigJson {
    added: Vec<FileHashAndPath>,
    changed: Vec<FileHashAndPath>,
}

#[derive(Clone, Data, Lens, Default)]
struct UpdateState {
    progressbar: f64,
}

pub fn main() {
    // describe the main window
    let main_window = WindowDesc::new(build_root_widget())
        .title("更新程序")
        .window_size((400.0, 40.0))
        .resizable(false)
        .show_titlebar(false);
    // create the initial app state
    // 进度条显示
    let initial_state: UpdateState = UpdateState { progressbar: 0.0 };
    // start the application. Here we pass in the application state.
    let launcher = AppLauncher::with_window(main_window);
    // 给进度条的回调
    let event_sink = launcher.get_external_handle();
    thread::spawn(move || set_progressbar(event_sink));
    launcher
        .log_to_console()
        .launch(initial_state)
        .expect("Failed to launch application");
}
// todo 出错后版本后退问题， 中断继续问题
fn copy_file(
    event_sink: &druid::ExtEventSink,
    config: &UpdateConfigJson,
    path: &OsString,
    update_temp_path: &OsString,
) {
    let mut hand_file_num = 0.0;
    let total_file = (config.added.len() + config.changed.len()) as f64;
    // 结束进程后迁移文件
    for item in config.added.iter().chain(config.changed.iter()) {
        hand_file_num += 1.0;
        let file_path = Path::new(&path).join(&item.file_path);
        println!("{:?} {}", &file_path, hand_file_num);
        let from_path = Path::new(&update_temp_path).join(&item.hash);
        event_sink.add_idle_callback(move |data: &mut UpdateState| {
            println!("{}", data.progressbar);
            data.progressbar = (hand_file_num / total_file) as f64;
        });
        // ui绘制时间
        thread::sleep(Duration::from_millis(10));
        if !from_path.is_file() {
            // 缺少依赖处理 todo
            continue;
        }
        if file_path.is_file() {
            if let Err(_) = fs::remove_file(&file_path) {
                // 删除对应文件产生错误处理 todo
            };
        }
        if let Err(_) = fs::create_dir_all(file_path.parent().unwrap()) {
            // 创建父文件夹失败处理 todo
        }
        if let Err(_) = fs::copy(from_path, file_path) {
            // 复制文件到对应路径错误处理 todo
        }
    }
}

fn set_progressbar(event_sink: druid::ExtEventSink) {
    // 当前执行exe的 没传过来直接结束进程
    std::thread::sleep(Duration::from_millis(100));
    let exe_path = match env::var("exe_path") {
        Ok(path) if Path::new(&path).is_absolute() => Path::new(&path).as_os_str().to_owned(),
        _ => {
            event_sink.add_idle_callback(move |_: &mut UpdateState| {
                Application::global().quit();
            });
            return;
        }
    };
    let path = Path::new(&exe_path)
        .parent()
        .unwrap()
        .as_os_str()
        .to_owned();
    // 更新temp目录
    let update_temp_path = match env::var("update_temp_path") {
        Ok(path) if Path::new(&path).is_absolute() => Path::new(&path).as_os_str().to_owned(),
        _ => Path::new(&path).join("update_temp").as_os_str().to_owned(),
    };
    let update_config_file_name = match env::var("update_config_file_name") {
        Ok(name) => name,
        _ => "update-config.json".to_string(),
    };
    // todo 处理读取更新配置出错
    let config: UpdateConfigJson = serde_json::from_slice(
        &fs::read(Path::new(&update_temp_path).join(update_config_file_name)).unwrap_or_default(),
    )
    .unwrap();
    // 如果读取到需要更新的配置时才更新 结束进程
    if config.added.len() > 0 || config.changed.len() > 0 {
        // 系统的所有信息，包括进程信息
        let sys = System::new_all();
        let current_exe_path = env::current_exe().unwrap();
        //注意 如果有其他进程的执行exe的路径是直接kill掉处理
        for (_pid, process) in sys.processes() {
            match process.exe() {
                v if v.starts_with(&path) && v != current_exe_path => {
                    process.kill(Signal::Kill);
                }
                _ => continue,
            };
        }
    }
    copy_file(&event_sink, &config, &path, &update_temp_path);
    // 更新结束 退出ui
    println!("done");
    // 重启exe
    process::Command::new(exe_path)
        .spawn()
        .unwrap();
    event_sink.add_idle_callback(move |_: &mut UpdateState| {
        Application::global().quit();
    });
}

fn build_root_widget() -> impl Widget<UpdateState> {
    Flex::column()
        .with_spacer(10.0)
        .with_child(
            ProgressBarWidget::new()
                .on_added(|_, _, _, _| {
                    println!("on_added");
                })
                .lens(UpdateState::progressbar),
        )
        .must_fill_main_axis(true)
        .background(Color::rgb8(0xBA, 0xBA, 0xBA))
}
#[derive(Debug, Clone, Default)]
struct ProgressBarWidget {}
impl ProgressBarWidget {
    pub fn new() -> ProgressBarWidget {
        Self::default()
    }
}
impl Widget<f64> for ProgressBarWidget {
    fn event(&mut self, _ctx: &mut EventCtx, _event: &Event, _data: &mut f64, _env: &Env) {}
    fn lifecycle(&mut self, _ctx: &mut LifeCycleCtx, _event: &LifeCycle, _data: &f64, _env: &Env) {}
    fn update(&mut self, ctx: &mut UpdateCtx, _old_data: &f64, _data: &f64, _env: &Env) {
        ctx.request_paint();
    }
    fn layout(
        &mut self,
        _layout_ctx: &mut LayoutCtx,
        bc: &BoxConstraints,
        _data: &f64,
        _env: &Env,
    ) -> Size {
        // width height 宽高
        bc.constrain((360.0, 40.0))
    }
    fn paint(&mut self, ctx: &mut PaintCtx, data: &f64, env: &Env) {
        let height = env.get(theme::BASIC_WIDGET_HEIGHT);
        let corner_radius = env.get(theme::PROGRESS_BAR_RADIUS);
        let clamped = data.max(0.0).min(1.0);
        let stroke_width = 2.0;
        let inset = -stroke_width / 2.0;
        let size = ctx.size();
        // let str = format!("{:.2}%", clamped * 100.0);
        let rounded_rect = Size::new(size.width, height)
            .to_rect()
            .inset(inset)
            .to_rounded_rect(corner_radius);

        // Paint the border
        ctx.stroke(rounded_rect, &env.get(theme::BORDER_DARK), stroke_width);

        // Paint the background
        let background_gradient = LinearGradient::new(
            UnitPoint::TOP,
            UnitPoint::BOTTOM,
            (
                env.get(theme::BACKGROUND_LIGHT),
                env.get(theme::BACKGROUND_DARK),
            ),
        );
        ctx.fill(rounded_rect, &background_gradient);

        // Paint the bar
        let calculated_bar_width = clamped * rounded_rect.width();

        let rounded_rect = Rect::from_origin_size(
            Point::new(-inset, 0.),
            Size::new(calculated_bar_width, height),
        )
        .inset((0.0, inset))
        .to_rounded_rect(corner_radius);

        let bar_gradient = LinearGradient::new(
            UnitPoint::TOP,
            UnitPoint::BOTTOM,
            (env.get(theme::PRIMARY_LIGHT), env.get(theme::PRIMARY_DARK)),
        );
        ctx.fill(rounded_rect, &bar_gradient);
    }
    fn debug_state(&self, data: &f64) -> DebugState {
        DebugState {
            display_name: self.short_type_name().to_string(),
            main_value: data.to_string(),
            ..Default::default()
        }
    }
}
