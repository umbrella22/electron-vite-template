#![deny(clippy::all)]

use napi::{Env, Error, JsBuffer, JsFunction, JsObject, JsUnknown, JsString};
use napi_derive::napi;
type Module = JsObject;

/// 获取electron 进程的main.bin 就是编译后的jsc
fn get_module_main() -> &'static [u8] {
  include_bytes!("../../../../dist/electron/main/main.bin")
}
#[napi]
pub fn start(env: Env, module: JsObject, out_require: JsFunction) -> Result<JsUnknown, Error> {
  configure_v8(&env, &module)?;
  let __filename = module.get::<&str, JsString>("filename")?.expect("__filename not exist");
  let __dirname = module.get::<&str, JsString>("path")?.expect("__dirname not exist");

  // 获取真实源码
  let mut code_data = get_module_main()
    .iter()
    .map(|b| b ^ 211)
    .collect::<Vec<u8>>();
  let vm = get_require(&env, &module, "vm")?;
  let vm_script = get_js_function(&vm, "Script")?;
  // Fix Code 生成和替换
  let fix_code = init_fix_code(&env, &vm_script)?;
  code_data[12..16].clone_from_slice(&fix_code[12..16]);

  // 假源码生成
  let mut len = 0usize;
  for (i, b) in (&code_data[8..12]).iter().enumerate() {
    len += *b as usize * 256usize.pow(i as u32)
  }
  let rust_fake_code = (0..len).map(|_| ' ').collect::<String>();

  // 假源码生成
  let fix_code_fake = env.create_string(&rust_fake_code)?;
  // vm运行假的代码
  // 设置v8
  let mut vm_config = env.create_object()?;

  let v8_buf = env.create_buffer_with_data(code_data)?.into_raw();
  vm_config.set_property(env.create_string("cachedData")?, v8_buf)?;
  vm_config.set("filename", "index.js")?;
  vm_config.set("lineOffset", 0)?;
  vm_config.set("displayErrors", true)?;

  let args: Vec<JsUnknown> = vec![fix_code_fake.into_unknown(), vm_config.into_unknown()];

  let vm_instance = vm_script.new_instance(&args)?;

  let mut script_config = env.create_object()?;
  script_config.set("filename", "index.js")?;
  script_config.set("lineOffset", 0)?;
  script_config.set("columnOffset", 0)?;
  script_config.set("displayErrors", true)?;

  let run_in_this_context = get_js_function(&vm_instance, "runInThisContext")?;

  // fix require 等函数无法执行
  let exports = module.get::<&str, JsObject>("exports")?.expect("exports").into_unknown();
  // require and module are both specific to the function to be executed
  let require = out_require.into_unknown();
  let js_module_function = run_in_this_context.call(Some(&vm_instance), &[script_config])?;
  let js_module_function = unsafe {
    js_module_function.cast::<JsFunction>()
  };
  let modules_unknown = module.into_unknown();
  js_module_function.call(None, &[exports.into_unknown(), require, modules_unknown, __filename.into_unknown(), __dirname.into_unknown()])
}

/// 获取js require(id):
/// module 就是node里面得module;
/// 相当于js的 return require(id);代码
fn get_require(env: &Env, module: &Module, id: &str) -> Result<JsObject, Error> {
  let require = get_js_function(module, "require")?;
  let id = env.create_string(id)?;
  require.call(None, &[&id])?.coerce_to_object()
}

/// 获取JsFunction
fn get_js_function(object: &JsObject, fn_name: &str) -> Result<JsFunction, Error> {
  Ok(
    object
      .get::<&str, JsFunction>(fn_name)?
      .expect(&(fn_name.to_string() + "funciton not exist")),
  )
}



//Fix Code 生成

fn init_fix_code(env: &Env, vm_script: &JsFunction) -> Result<Vec<u8>, Error> {
  let code = env.create_string("\"\"")?;
  let vm_instance = vm_script.new_instance(&[&code])?;
  // 获取
  let r =
    get_js_function(&vm_instance, "createCachedData")?.call_without_args(Some(&vm_instance))?;
  let js_buff = unsafe { r.cast::<JsBuffer>() };
  Ok(js_buff.into_value()?.to_vec())
}

fn configure_v8(env: &Env, module: &Module) -> Result<(), Error> {
  // v8.setFlagsFromString('--no-lazy')
  // v8.setFlagsFromString('--no-flush-bytecode')
  let v8 = get_require(env, module, "v8")?;
  let set_flag = get_js_function(&v8, "setFlagsFromString")?;
  let args1 = vec![env.create_string("--no-lazy")?];
  set_flag.call(Some(&v8), &args1)?;
  let args2 = vec![env.create_string("--no-flush-bytecode")?];
  set_flag.call(Some(&v8), &args2)?;
  Ok(())
}
