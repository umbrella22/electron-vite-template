'use strict';

var electron = require('electron');
var express = require('express');
var http = require('http');
var require$$1 = require('path');
var url$1 = require('url');
var require$$0$1 = require('fs');
var require$$0 = require('constants');
var require$$6 = require('stream');
var require$$4 = require('util');
var require$$5 = require('assert');
var semver = require('semver');
var crypto = require('crypto');
var require$$0$2 = require('tty');
var require$$0$3 = require('buffer');
var require$$1$1 = require('zlib');
var require$$4$1 = require('events');
var axios = require('axios');
var child_process = require('child_process');
var os = require('os');
var electronUpdater = require('electron-updater');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$6__default = /*#__PURE__*/_interopDefaultLegacy(require$$6);
var require$$4__default = /*#__PURE__*/_interopDefaultLegacy(require$$4);
var require$$5__default = /*#__PURE__*/_interopDefaultLegacy(require$$5);
var require$$0__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$0__default$3 = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);
var require$$1__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$1$1);
var require$$4__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$4$1);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

var prod = {
  NODE_ENV: "production",
  BASE_API: "http://127.0.0.1:25565",
  is_web: false
};

var dev = {
  NODE_ENV: "development",
  BASE_API: "http://127.0.0.1:25565",
  is_web: false
};

var config = {
  build: {
    env: prod,
    hotPublishUrl: "http://umbrella22.github.io/electron-vite-template",
    hotPublishConfigName: "update-config"
  },
  dev: {
    env: dev,
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080
  },
  DisableF12: true,
  DllFolder: "",
  HotUpdateFolder: "update",
  UseStartupChart: true,
  IsUseSysTitle: false,
  BuiltInServerPort: 25565
};

const app = express__default["default"]();
app.get("/message", (req, res) => {
  res.send("\u8FD9\u662F\u6765\u81EAnode\u670D\u52A1\u7AEF\u7684\u4FE1\u606F");
});
app.post("/message", (req, res) => {
  if (req) {
    res.send(req + "--\u6765\u81EAnode");
  }
});

const port = config.BuiltInServerPort;
class SingleServer {
  constructor(app2) {
    app2.set("port", port);
    this.server = http.createServer(app2);
    this.server.keepAliveTimeout = 0;
    this.server.on("connection", (socket) => {
      socket.setTimeout(1e3);
    });
  }
  statrServer() {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port);
        resolve("\u670D\u52A1\u7AEF\u5DF2\u7ECF\u542F\u52A8");
      } catch (error) {
        switch (error.code) {
          case "ERR_SERVER_ALREADY_LISTEN":
            resolve("\u670D\u52A1\u7AEF\u5DF2\u7ECF\u542F\u52A8");
            break;
          case "EACCES":
            reject("\u6743\u9650\u4E0D\u8DB3\u5185\u7F6E\u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF0C\u8BF7\u4F7F\u7528\u7BA1\u7406\u5458\u6743\u9650\u8FD0\u884C\u3002");
            break;
          case "EADDRINUSE":
            reject("\u5185\u7F6E\u670D\u52A1\u5668\u7AEF\u53E3\u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u68C0\u67E5\u3002");
            break;
          default:
            reject(error);
        }
      }
    });
  }
  stopServer() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          switch (err.code) {
            case "ERR_SERVER_NOT_RUNNING":
              resolve("\u670D\u52A1\u7AEF\u672A\u542F\u52A8");
              break;
            default:
              reject(err);
          }
        } else {
          resolve(1);
        }
      });
    });
  }
}
const singleServer = new SingleServer(app);
var Server = {
  StatrServer() {
    return singleServer.statrServer();
  },
  StopServer() {
    return singleServer.stopServer();
  }
};

class StaticPath {
  constructor() {
    const basePath = require$$1.join(electron.app.getAppPath(), "..", "..");
    this.__updateFolder = require$$1.join(basePath, `${config.HotUpdateFolder}`);
    {
      this.__static = require$$1.join(__dirname, "..", "renderer");
      this.__lib = basePath;
      this.__common = basePath;
    }
  }
}
const staticPath = new StaticPath();
function getUrl(devPath, proPath, hash = "", search = "") {
  const url = new url$1.URL("file://");
  url.pathname = proPath;
  url.hash = hash;
  url.search = search;
  return url.href;
}
const winURL = getUrl("", require$$1.join(__dirname, "..", "renderer", "index.html"));
const loadingURL = getUrl("/loader.html", `${staticPath.__static}/loader.html`);
getUrl("/preload.html", `${staticPath.__static}/preload.html`);
const printURL = getUrl("", require$$1.join(__dirname, "..", "renderer", "index.html"), "#/Print");
require$$1.join(electron.app.getAppPath(), "dist", "electron", "preload.js");
staticPath.__lib;
staticPath.__common;
staticPath.__updateFolder;
const staticPaths = getUrl("", staticPath.__static);
for (const key in staticPath) {
  process.env[key] = staticPath[key];
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var fs$m = {};

var universalify$1 = {};

universalify$1.fromCallback = function (fn) {
  return Object.defineProperty(function (...args) {
    if (typeof args[args.length - 1] === 'function') fn.apply(this, args);
    else {
      return new Promise((resolve, reject) => {
        fn.call(
          this,
          ...args,
          (err, res) => (err != null) ? reject(err) : resolve(res)
        );
      })
    }
  }, 'name', { value: fn.name })
};

universalify$1.fromPromise = function (fn) {
  return Object.defineProperty(function (...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== 'function') return fn.apply(this, args)
    else fn.apply(this, args.slice(0, -1)).then(r => cb(null, r), cb);
  }, 'name', { value: fn.name })
};

var constants = require$$0__default["default"];

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd
};
try {
  process.cwd();
} catch (er) {}

// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
  var chdir = process.chdir;
  process.chdir = function (d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}

var polyfills$1 = patch$1;

function patch$1 (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (fs.chmod && !fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function () {};
  }
  if (fs.chown && !fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = typeof fs.rename !== 'function' ? fs.rename
    : (function (fs$rename) {
      function rename (from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB (er) {
          if (er
              && (er.code === "EACCES" || er.code === "EPERM")
              && Date.now() - start < 60000) {
            setTimeout(function() {
              fs.stat(to, function (stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
      return rename
    })(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = typeof fs.read !== 'function' ? fs.read
  : (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read
  })(fs.read);

  fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync
  : (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs.readSync);

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret
      };

    } else if (fs.futimes) {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 0x100000000;
        if (stats.gid < 0) stats.gid += 0x100000000;
      }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream = require$$6__default["default"].Stream;

var legacyStreams = legacy$1;

function legacy$1 (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone$1;

var getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__
};

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var fs$l = require$$0__default$1["default"];
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;

var util$3 = require$$4__default["default"];

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop$2 () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  });
}

var debug$1 = noop$2;
if (util$3.debuglog)
  debug$1 = util$3.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug$1 = function() {
    var m = util$3.format.apply(util$3, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

// Once time initialization
if (!fs$l[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$l, queue);

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs$l.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs$l, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          resetQueue();
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments);
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs$l.close);

  fs$l.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs$l, arguments);
      resetQueue();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs$l.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug$1(fs$l[gracefulQueue]);
      require$$5__default["default"].equal(fs$l[gracefulQueue].length, 0);
    });
  }
}

if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$l[gracefulQueue]);
}

var gracefulFs = patch(clone(fs$l));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$l.__patched) {
    gracefulFs = patch(fs$l);
    fs$l.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;
  var fs$readFile = fs.readFile;
  fs.readFile = readFile;
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb, startTime) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile;
  fs.writeFile = writeFile;
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb, startTime) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile;
  if (fs$appendFile)
    fs.appendFile = appendFile;
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb, startTime) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$copyFile = fs.copyFile;
  if (fs$copyFile)
    fs.copyFile = copyFile;
  function copyFile (src, dest, flags, cb) {
    if (typeof flags === 'function') {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb)

    function go$copyFile (src, dest, flags, cb, startTime) {
      return fs$copyFile(src, dest, flags, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$readdir = fs.readdir;
  fs.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    var go$readdir = noReaddirOptionVersions.test(process.version)
      ? function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, fs$readdirCallback(
          path, options, cb, startTime
        ))
      }
      : function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, options, fs$readdirCallback(
          path, options, cb, startTime
        ))
      };

    return go$readdir(path, options, cb)

    function fs$readdirCallback (path, options, cb, startTime) {
      return function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([
            go$readdir,
            [path, options, cb],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();

          if (typeof cb === 'function')
            cb.call(this, err, files);
        }
      }
    }
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open;
  fs.open = open;
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb, startTime) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug$1('ENQUEUE', elem[0].name, elem[1]);
  fs$l[gracefulQueue].push(elem);
  retry();
}

// keep track of the timeout between retry() calls
var retryTimer;

// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue () {
  var now = Date.now();
  for (var i = 0; i < fs$l[gracefulQueue].length; ++i) {
    // entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs$l[gracefulQueue][i].length > 2) {
      fs$l[gracefulQueue][i][3] = now; // startTime
      fs$l[gracefulQueue][i][4] = now; // lastTime
    }
  }
  // call retry to make sure we're actively processing the queue
  retry();
}

function retry () {
  // clear the timer and remove it to help prevent unintended concurrency
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs$l[gracefulQueue].length === 0)
    return

  var elem = fs$l[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  // these items may be unset if they were added by an older graceful-fs
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];

  // if we don't have a startTime we have no way of knowing if we've waited
  // long enough, so go ahead and retry this item now
  if (startTime === undefined) {
    debug$1('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    // it's been more than 60 seconds total, bail now
    debug$1('TIMEOUT', fn.name, args);
    var cb = args.pop();
    if (typeof cb === 'function')
      cb.call(null, err);
  } else {
    // the amount of time between the last attempt and right now
    var sinceAttempt = Date.now() - lastTime;
    // the amount of time between when we first tried, and when we last tried
    // rounded up to at least 1
    var sinceStart = Math.max(lastTime - startTime, 1);
    // backoff. wait longer than the total time we've been retrying, but only
    // up to a maximum of 100ms
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    // it's been long enough since the last retry, do it again
    if (sinceAttempt >= desiredDelay) {
      debug$1('RETRY', fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      // if we can't do this job yet, push it to the end of the queue
      // and let the next iteration check again
      fs$l[gracefulQueue].push(elem);
    }
  }

  // schedule our next run if one isn't already scheduled
  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}

(function (exports) {
	// This is adapted from https://github.com/normalize/mz
	// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
	const u = universalify$1.fromCallback;
	const fs = gracefulFs;

	const api = [
	  'access',
	  'appendFile',
	  'chmod',
	  'chown',
	  'close',
	  'copyFile',
	  'fchmod',
	  'fchown',
	  'fdatasync',
	  'fstat',
	  'fsync',
	  'ftruncate',
	  'futimes',
	  'lchmod',
	  'lchown',
	  'link',
	  'lstat',
	  'mkdir',
	  'mkdtemp',
	  'open',
	  'opendir',
	  'readdir',
	  'readFile',
	  'readlink',
	  'realpath',
	  'rename',
	  'rm',
	  'rmdir',
	  'stat',
	  'symlink',
	  'truncate',
	  'unlink',
	  'utimes',
	  'writeFile'
	].filter(key => {
	  // Some commands are not available on some systems. Ex:
	  // fs.opendir was added in Node.js v12.12.0
	  // fs.rm was added in Node.js v14.14.0
	  // fs.lchown is not available on at least some Linux
	  return typeof fs[key] === 'function'
	});

	// Export cloned fs:
	Object.assign(exports, fs);

	// Universalify async methods:
	api.forEach(method => {
	  exports[method] = u(fs[method]);
	});

	// We differ from mz/fs in that we still ship the old, broken, fs.exists()
	// since we are a drop-in replacement for the native module
	exports.exists = function (filename, callback) {
	  if (typeof callback === 'function') {
	    return fs.exists(filename, callback)
	  }
	  return new Promise(resolve => {
	    return fs.exists(filename, resolve)
	  })
	};

	// fs.read(), fs.write(), & fs.writev() need special treatment due to multiple callback args

	exports.read = function (fd, buffer, offset, length, position, callback) {
	  if (typeof callback === 'function') {
	    return fs.read(fd, buffer, offset, length, position, callback)
	  }
	  return new Promise((resolve, reject) => {
	    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
	      if (err) return reject(err)
	      resolve({ bytesRead, buffer });
	    });
	  })
	};

	// Function signature can be
	// fs.write(fd, buffer[, offset[, length[, position]]], callback)
	// OR
	// fs.write(fd, string[, position[, encoding]], callback)
	// We need to handle both cases, so we use ...args
	exports.write = function (fd, buffer, ...args) {
	  if (typeof args[args.length - 1] === 'function') {
	    return fs.write(fd, buffer, ...args)
	  }

	  return new Promise((resolve, reject) => {
	    fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
	      if (err) return reject(err)
	      resolve({ bytesWritten, buffer });
	    });
	  })
	};

	// fs.writev only available in Node v12.9.0+
	if (typeof fs.writev === 'function') {
	  // Function signature is
	  // s.writev(fd, buffers[, position], callback)
	  // We need to handle the optional arg, so we use ...args
	  exports.writev = function (fd, buffers, ...args) {
	    if (typeof args[args.length - 1] === 'function') {
	      return fs.writev(fd, buffers, ...args)
	    }

	    return new Promise((resolve, reject) => {
	      fs.writev(fd, buffers, ...args, (err, bytesWritten, buffers) => {
	        if (err) return reject(err)
	        resolve({ bytesWritten, buffers });
	      });
	    })
	  };
	}

	// fs.realpath.native sometimes not available if fs is monkey-patched
	if (typeof fs.realpath.native === 'function') {
	  exports.realpath.native = u(fs.realpath.native);
	} else {
	  process.emitWarning(
	    'fs.realpath.native is not a function. Is fs being monkey-patched?',
	    'Warning', 'fs-extra-WARN0003'
	  );
	}
} (fs$m));

var makeDir$1 = {};

var utils$1 = {};

const path$d = require$$1__default["default"];

// https://github.com/nodejs/node/issues/8987
// https://github.com/libuv/libuv/pull/1088
utils$1.checkPath = function checkPath (pth) {
  if (process.platform === 'win32') {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$d.parse(pth).root, ''));

    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`);
      error.code = 'EINVAL';
      throw error
    }
  }
};

const fs$k = fs$m;
const { checkPath } = utils$1;

const getMode = options => {
  const defaults = { mode: 0o777 };
  if (typeof options === 'number') return options
  return ({ ...defaults, ...options }).mode
};

makeDir$1.makeDir = async (dir, options) => {
  checkPath(dir);

  return fs$k.mkdir(dir, {
    mode: getMode(options),
    recursive: true
  })
};

makeDir$1.makeDirSync = (dir, options) => {
  checkPath(dir);

  return fs$k.mkdirSync(dir, {
    mode: getMode(options),
    recursive: true
  })
};

const u$a = universalify$1.fromPromise;
const { makeDir: _makeDir, makeDirSync } = makeDir$1;
const makeDir = u$a(_makeDir);

var mkdirs$2 = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
};

const u$9 = universalify$1.fromPromise;
const fs$j = fs$m;

function pathExists$6 (path) {
  return fs$j.access(path).then(() => true).catch(() => false)
}

var pathExists_1 = {
  pathExists: u$9(pathExists$6),
  pathExistsSync: fs$j.existsSync
};

const fs$i = gracefulFs;

function utimesMillis$1 (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs$i.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs$i.futimes(fd, atime, mtime, futimesErr => {
      fs$i.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr);
      });
    });
  });
}

function utimesMillisSync$1 (path, atime, mtime) {
  const fd = fs$i.openSync(path, 'r+');
  fs$i.futimesSync(fd, atime, mtime);
  return fs$i.closeSync(fd)
}

var utimes = {
  utimesMillis: utimesMillis$1,
  utimesMillisSync: utimesMillisSync$1
};

const fs$h = fs$m;
const path$c = require$$1__default["default"];
const util$2 = require$$4__default["default"];

function getStats$2 (src, dest, opts) {
  const statFunc = opts.dereference
    ? (file) => fs$h.stat(file, { bigint: true })
    : (file) => fs$h.lstat(file, { bigint: true });
  return Promise.all([
    statFunc(src),
    statFunc(dest).catch(err => {
      if (err.code === 'ENOENT') return null
      throw err
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }))
}

function getStatsSync (src, dest, opts) {
  let destStat;
  const statFunc = opts.dereference
    ? (file) => fs$h.statSync(file, { bigint: true })
    : (file) => fs$h.lstatSync(file, { bigint: true });
  const srcStat = statFunc(src);
  try {
    destStat = statFunc(dest);
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, opts, cb) {
  util$2.callbackify(getStats$2)(src, dest, opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;

    if (destStat) {
      if (areIdentical$2(srcStat, destStat)) {
        const srcBaseName = path$c.basename(src);
        const destBaseName = path$c.basename(dest);
        if (funcName === 'move' &&
          srcBaseName !== destBaseName &&
          srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
          return cb(null, { srcStat, destStat, isChangingCase: true })
        }
        return cb(new Error('Source and destination must not be the same.'))
      }
      if (srcStat.isDirectory() && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
      }
      if (!srcStat.isDirectory() && destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`))
      }
    }

    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  });
}

function checkPathsSync (src, dest, funcName, opts) {
  const { srcStat, destStat } = getStatsSync(src, dest, opts);

  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$c.basename(src);
      const destBaseName = path$c.basename(dest);
      if (funcName === 'move' &&
        srcBaseName !== destBaseName &&
        srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true }
      }
      throw new Error('Source and destination must not be the same.')
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`)
    }
  }

  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path$c.resolve(path$c.dirname(src));
  const destParent = path$c.resolve(path$c.dirname(dest));
  if (destParent === srcParent || destParent === path$c.parse(destParent).root) return cb()
  fs$h.stat(destParent, { bigint: true }, (err, destStat) => {
    if (err) {
      if (err.code === 'ENOENT') return cb()
      return cb(err)
    }
    if (areIdentical$2(srcStat, destStat)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return checkParentPaths(src, srcStat, destParent, funcName, cb)
  });
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path$c.resolve(path$c.dirname(src));
  const destParent = path$c.resolve(path$c.dirname(dest));
  if (destParent === srcParent || destParent === path$c.parse(destParent).root) return
  let destStat;
  try {
    destStat = fs$h.statSync(destParent, { bigint: true });
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

function areIdentical$2 (srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path$c.resolve(src).split(path$c.sep).filter(i => i);
  const destArr = path$c.resolve(dest).split(path$c.sep).filter(i => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

var stat$4 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir,
  areIdentical: areIdentical$2
};

const fs$g = gracefulFs;
const path$b = require$$1__default["default"];
const mkdirs$1 = mkdirs$2.mkdirs;
const pathExists$5 = pathExists_1.pathExists;
const utimesMillis = utimes.utimesMillis;
const stat$3 = stat$4;

function copy$2 (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    process.emitWarning(
      'Using the preserveTimestamps option in 32-bit node is not recommended;\n\n' +
      '\tsee https://github.com/jprichardson/node-fs-extra/issues/269',
      'Warning', 'fs-extra-WARN0001'
    );
  }

  stat$3.checkPaths(src, dest, 'copy', opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    stat$3.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    });
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path$b.dirname(dest);
  pathExists$5(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return getStats$1(destStat, src, dest, opts, cb)
    mkdirs$1(destParent, err => {
      if (err) return cb(err)
      return getStats$1(destStat, src, dest, opts, cb)
    });
  });
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error));
}

function startCopy$1 (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats$1, destStat, src, dest, opts, cb)
  return getStats$1(destStat, src, dest, opts, cb)
}

function getStats$1 (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? fs$g.stat : fs$g.lstat;
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink$1(destStat, src, dest, opts, cb)
    else if (srcStat.isSocket()) return cb(new Error(`Cannot copy a socket file: ${src}`))
    else if (srcStat.isFIFO()) return cb(new Error(`Cannot copy a FIFO pipe: ${src}`))
    return cb(new Error(`Unknown file: ${src}`))
  });
}

function onFile$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile$1(srcStat, src, dest, opts, cb)
  return mayCopyFile$1(srcStat, src, dest, opts, cb)
}

function mayCopyFile$1 (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs$g.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile$1(srcStat, src, dest, opts, cb)
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile$1 (srcStat, src, dest, opts, cb) {
  fs$g.copyFile(src, dest, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src, dest, cb)
    return setDestMode$1(dest, srcStat.mode, cb)
  });
}

function handleTimestampsAndMode (srcMode, src, dest, cb) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable$1(srcMode)) {
    return makeFileWritable$1(dest, srcMode, err => {
      if (err) return cb(err)
      return setDestTimestampsAndMode(srcMode, src, dest, cb)
    })
  }
  return setDestTimestampsAndMode(srcMode, src, dest, cb)
}

function fileIsNotWritable$1 (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable$1 (dest, srcMode, cb) {
  return setDestMode$1(dest, srcMode | 0o200, cb)
}

function setDestTimestampsAndMode (srcMode, src, dest, cb) {
  setDestTimestamps$1(src, dest, err => {
    if (err) return cb(err)
    return setDestMode$1(dest, srcMode, cb)
  });
}

function setDestMode$1 (dest, srcMode, cb) {
  return fs$g.chmod(dest, srcMode, cb)
}

function setDestTimestamps$1 (src, dest, cb) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  fs$g.stat(src, (err, updatedSrcStat) => {
    if (err) return cb(err)
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb)
  });
}

function onDir$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy$1(srcStat.mode, src, dest, opts, cb)
  return copyDir$1(src, dest, opts, cb)
}

function mkDirAndCopy$1 (srcMode, src, dest, opts, cb) {
  fs$g.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir$1(src, dest, opts, err => {
      if (err) return cb(err)
      return setDestMode$1(dest, srcMode, cb)
    });
  });
}

function copyDir$1 (src, dest, opts, cb) {
  fs$g.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  });
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item) return cb()
  return copyDirItem$1(items, item, src, dest, opts, cb)
}

function copyDirItem$1 (items, item, src, dest, opts, cb) {
  const srcItem = path$b.join(src, item);
  const destItem = path$b.join(dest, item);
  stat$3.checkPaths(srcItem, destItem, 'copy', opts, (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats;
    startCopy$1(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    });
  });
}

function onLink$1 (destStat, src, dest, opts, cb) {
  fs$g.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path$b.resolve(process.cwd(), resolvedSrc);
    }

    if (!destStat) {
      return fs$g.symlink(resolvedSrc, dest, cb)
    } else {
      fs$g.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$g.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path$b.resolve(process.cwd(), resolvedDest);
        }
        if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink$1(resolvedSrc, dest, cb)
      });
    }
  });
}

function copyLink$1 (resolvedSrc, dest, cb) {
  fs$g.unlink(dest, err => {
    if (err) return cb(err)
    return fs$g.symlink(resolvedSrc, dest, cb)
  });
}

var copy_1 = copy$2;

const fs$f = gracefulFs;
const path$a = require$$1__default["default"];
const mkdirsSync$1 = mkdirs$2.mkdirsSync;
const utimesMillisSync = utimes.utimesMillisSync;
const stat$2 = stat$4;

function copySync$1 (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    process.emitWarning(
      'Using the preserveTimestamps option in 32-bit node is not recommended;\n\n' +
      '\tsee https://github.com/jprichardson/node-fs-extra/issues/269',
      'Warning', 'fs-extra-WARN0002'
    );
  }

  const { srcStat, destStat } = stat$2.checkPathsSync(src, dest, 'copy', opts);
  stat$2.checkParentPathsSync(src, srcStat, dest, 'copy');
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path$a.dirname(dest);
  if (!fs$f.existsSync(destParent)) mkdirsSync$1(destParent);
  return getStats(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(destStat, src, dest, opts)
}

function getStats (destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$f.statSync : fs$f.lstatSync;
  const srcStat = statSync(src);

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
  else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`)
  else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`)
  throw new Error(`Unknown file: ${src}`)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$f.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  fs$f.copyFileSync(src, dest);
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest);
  return setDestMode(dest, srcStat.mode)
}

function handleTimestamps (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
  return setDestTimestamps(src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

function setDestMode (dest, srcMode) {
  return fs$f.chmodSync(dest, srcMode)
}

function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  const updatedSrcStat = fs$f.statSync(src);
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts)
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcMode, src, dest, opts) {
  fs$f.mkdirSync(dest);
  copyDir(src, dest, opts);
  return setDestMode(dest, srcMode)
}

function copyDir (src, dest, opts) {
  fs$f.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts));
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path$a.join(src, item);
  const destItem = path$a.join(dest, item);
  const { destStat } = stat$2.checkPathsSync(srcItem, destItem, 'copy', opts);
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  let resolvedSrc = fs$f.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$a.resolve(process.cwd(), resolvedSrc);
  }

  if (!destStat) {
    return fs$f.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$f.readlinkSync(dest);
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$f.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path$a.resolve(process.cwd(), resolvedDest);
    }
    if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs$f.statSync(dest).isDirectory() && stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  fs$f.unlinkSync(dest);
  return fs$f.symlinkSync(resolvedSrc, dest)
}

var copySync_1 = copySync$1;

const u$8 = universalify$1.fromCallback;
var copy$1 = {
  copy: u$8(copy_1),
  copySync: copySync_1
};

const fs$e = gracefulFs;
const path$9 = require$$1__default["default"];
const assert = require$$5__default["default"];

const isWindows = (process.platform === 'win32');

function defaults (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(m => {
    options[m] = options[m] || fs$e[m];
    m = m + 'Sync';
    options[m] = options[m] || fs$e[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
}

function rimraf$1 (p, options, cb) {
  let busyTries = 0;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  defaults(options);

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null;
    }

    cb(er);
  });
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    });
  });
}

function fixWinEPERM (p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}

function fixWinEPERMSync (p, options, er) {
  let stats;

  assert(p);
  assert(options);

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb);
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}

function rmkids (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length;
    let errState;

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf$1(path$9.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st;

  options = options || {};
  defaults(options);

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows) {
      fixWinEPERMSync(p, options, er);
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er);
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p);
  assert(options);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options);
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(f => rimrafSync(path$9.join(p, f), options));

  if (isWindows) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now();
    do {
      try {
        const ret = options.rmdirSync(p, options);
        return ret
      } catch {}
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options);
    return ret
  }
}

var rimraf_1 = rimraf$1;
rimraf$1.sync = rimrafSync;

const fs$d = gracefulFs;
const u$7 = universalify$1.fromCallback;
const rimraf = rimraf_1;

function remove$2 (path, callback) {
  // Node 14.14.0+
  if (fs$d.rm) return fs$d.rm(path, { recursive: true, force: true }, callback)
  rimraf(path, callback);
}

function removeSync$1 (path) {
  // Node 14.14.0+
  if (fs$d.rmSync) return fs$d.rmSync(path, { recursive: true, force: true })
  rimraf.sync(path);
}

var remove_1 = {
  remove: u$7(remove$2),
  removeSync: removeSync$1
};

const u$6 = universalify$1.fromPromise;
const fs$c = fs$m;
const path$8 = require$$1__default["default"];
const mkdir$3 = mkdirs$2;
const remove$1 = remove_1;

const emptyDir = u$6(async function emptyDir (dir) {
  let items;
  try {
    items = await fs$c.readdir(dir);
  } catch {
    return mkdir$3.mkdirs(dir)
  }

  return Promise.all(items.map(item => remove$1.remove(path$8.join(dir, item))))
});

function emptyDirSync (dir) {
  let items;
  try {
    items = fs$c.readdirSync(dir);
  } catch {
    return mkdir$3.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path$8.join(dir, item);
    remove$1.removeSync(item);
  });
}

var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};

const u$5 = universalify$1.fromCallback;
const path$7 = require$$1__default["default"];
const fs$b = gracefulFs;
const mkdir$2 = mkdirs$2;

function createFile$1 (file, callback) {
  function makeFile () {
    fs$b.writeFile(file, '', err => {
      if (err) return callback(err)
      callback();
    });
  }

  fs$b.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path$7.dirname(file);
    fs$b.stat(dir, (err, stats) => {
      if (err) {
        // if the directory doesn't exist, make it
        if (err.code === 'ENOENT') {
          return mkdir$2.mkdirs(dir, err => {
            if (err) return callback(err)
            makeFile();
          })
        }
        return callback(err)
      }

      if (stats.isDirectory()) makeFile();
      else {
        // parent is not a directory
        // This is just to cause an internal ENOTDIR error to be thrown
        fs$b.readdir(dir, err => {
          if (err) return callback(err)
        });
      }
    });
  });
}

function createFileSync$1 (file) {
  let stats;
  try {
    stats = fs$b.statSync(file);
  } catch {}
  if (stats && stats.isFile()) return

  const dir = path$7.dirname(file);
  try {
    if (!fs$b.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs$b.readdirSync(dir);
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT') mkdir$2.mkdirsSync(dir);
    else throw err
  }

  fs$b.writeFileSync(file, '');
}

var file = {
  createFile: u$5(createFile$1),
  createFileSync: createFileSync$1
};

const u$4 = universalify$1.fromCallback;
const path$6 = require$$1__default["default"];
const fs$a = gracefulFs;
const mkdir$1 = mkdirs$2;
const pathExists$4 = pathExists_1.pathExists;
const { areIdentical: areIdentical$1 } = stat$4;

function createLink$1 (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    fs$a.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null);
    });
  }

  fs$a.lstat(dstpath, (_, dstStat) => {
    fs$a.lstat(srcpath, (err, srcStat) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        return callback(err)
      }
      if (dstStat && areIdentical$1(srcStat, dstStat)) return callback(null)

      const dir = path$6.dirname(dstpath);
      pathExists$4(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdir$1.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}

function createLinkSync$1 (srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = fs$a.lstatSync(dstpath);
  } catch {}

  try {
    const srcStat = fs$a.lstatSync(srcpath);
    if (dstStat && areIdentical$1(srcStat, dstStat)) return
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink');
    throw err
  }

  const dir = path$6.dirname(dstpath);
  const dirExists = fs$a.existsSync(dir);
  if (dirExists) return fs$a.linkSync(srcpath, dstpath)
  mkdir$1.mkdirsSync(dir);

  return fs$a.linkSync(srcpath, dstpath)
}

var link = {
  createLink: u$4(createLink$1),
  createLinkSync: createLinkSync$1
};

const path$5 = require$$1__default["default"];
const fs$9 = gracefulFs;
const pathExists$3 = pathExists_1.pathExists;

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths$1 (srcpath, dstpath, callback) {
  if (path$5.isAbsolute(srcpath)) {
    return fs$9.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink');
        return callback(err)
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      })
    })
  } else {
    const dstdir = path$5.dirname(dstpath);
    const relativeToDst = path$5.join(dstdir, srcpath);
    return pathExists$3(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        })
      } else {
        return fs$9.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err)
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path$5.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync$1 (srcpath, dstpath) {
  let exists;
  if (path$5.isAbsolute(srcpath)) {
    exists = fs$9.existsSync(srcpath);
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      toCwd: srcpath,
      toDst: srcpath
    }
  } else {
    const dstdir = path$5.dirname(dstpath);
    const relativeToDst = path$5.join(dstdir, srcpath);
    exists = fs$9.existsSync(relativeToDst);
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      }
    } else {
      exists = fs$9.existsSync(srcpath);
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        toCwd: srcpath,
        toDst: path$5.relative(dstdir, srcpath)
      }
    }
  }
}

var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};

const fs$8 = gracefulFs;

function symlinkType$1 (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;
  if (type) return callback(null, type)
  fs$8.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file';
    callback(null, type);
  });
}

function symlinkTypeSync$1 (srcpath, type) {
  let stats;

  if (type) return type
  try {
    stats = fs$8.lstatSync(srcpath);
  } catch {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};

const u$3 = universalify$1.fromCallback;
const path$4 = require$$1__default["default"];
const fs$7 = fs$m;
const _mkdirs = mkdirs$2;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;

const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;

const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;

const pathExists$2 = pathExists_1.pathExists;

const { areIdentical } = stat$4;

function createSymlink$1 (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;

  fs$7.lstat(dstpath, (err, stats) => {
    if (!err && stats.isSymbolicLink()) {
      Promise.all([
        fs$7.stat(srcpath),
        fs$7.stat(dstpath)
      ]).then(([srcStat, dstStat]) => {
        if (areIdentical(srcStat, dstStat)) return callback(null)
        _createSymlink(srcpath, dstpath, type, callback);
      });
    } else _createSymlink(srcpath, dstpath, type, callback);
  });
}

function _createSymlink (srcpath, dstpath, type, callback) {
  symlinkPaths(srcpath, dstpath, (err, relative) => {
    if (err) return callback(err)
    srcpath = relative.toDst;
    symlinkType(relative.toCwd, type, (err, type) => {
      if (err) return callback(err)
      const dir = path$4.dirname(dstpath);
      pathExists$2(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return fs$7.symlink(srcpath, dstpath, type, callback)
        mkdirs(dir, err => {
          if (err) return callback(err)
          fs$7.symlink(srcpath, dstpath, type, callback);
        });
      });
    });
  });
}

function createSymlinkSync$1 (srcpath, dstpath, type) {
  let stats;
  try {
    stats = fs$7.lstatSync(dstpath);
  } catch {}
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs$7.statSync(srcpath);
    const dstStat = fs$7.statSync(dstpath);
    if (areIdentical(srcStat, dstStat)) return
  }

  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync(relative.toCwd, type);
  const dir = path$4.dirname(dstpath);
  const exists = fs$7.existsSync(dir);
  if (exists) return fs$7.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir);
  return fs$7.symlinkSync(srcpath, dstpath, type)
}

var symlink = {
  createSymlink: u$3(createSymlink$1),
  createSymlinkSync: createSymlinkSync$1
};

const { createFile, createFileSync } = file;
const { createLink, createLinkSync } = link;
const { createSymlink, createSymlinkSync } = symlink;

var ensure = {
  // file
  createFile,
  createFileSync,
  ensureFile: createFile,
  ensureFileSync: createFileSync,
  // link
  createLink,
  createLinkSync,
  ensureLink: createLink,
  ensureLinkSync: createLinkSync,
  // symlink
  createSymlink,
  createSymlinkSync,
  ensureSymlink: createSymlink,
  ensureSymlinkSync: createSymlinkSync
};

function stringify$3 (obj, { EOL = '\n', finalEOL = true, replacer = null, spaces } = {}) {
  const EOF = finalEOL ? EOL : '';
  const str = JSON.stringify(obj, replacer, spaces);

  return str.replace(/\n/g, EOL) + EOF
}

function stripBom$1 (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  return content.replace(/^\uFEFF/, '')
}

var utils = { stringify: stringify$3, stripBom: stripBom$1 };

let _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$0__default$1["default"];
}
const universalify = universalify$1;
const { stringify: stringify$2, stripBom } = utils;

async function _readFile (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || _fs;

  const shouldThrow = 'throws' in options ? options.throws : true;

  let data = await universalify.fromCallback(fs.readFile)(file, options);

  data = stripBom(data);

  let obj;
  try {
    obj = JSON.parse(data, options ? options.reviver : null);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err
    } else {
      return null
    }
  }

  return obj
}

const readFile = universalify.fromPromise(_readFile);

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || _fs;

  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let content = fs.readFileSync(file, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err
    } else {
      return null
    }
  }
}

async function _writeFile (file, obj, options = {}) {
  const fs = options.fs || _fs;

  const str = stringify$2(obj, options);

  await universalify.fromCallback(fs.writeFile)(file, str, options);
}

const writeFile = universalify.fromPromise(_writeFile);

function writeFileSync (file, obj, options = {}) {
  const fs = options.fs || _fs;

  const str = stringify$2(obj, options);
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

const jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};

var jsonfile_1 = jsonfile$1;

const jsonFile$1 = jsonfile_1;

var jsonfile = {
  // jsonfile exports
  readJson: jsonFile$1.readFile,
  readJsonSync: jsonFile$1.readFileSync,
  writeJson: jsonFile$1.writeFile,
  writeJsonSync: jsonFile$1.writeFileSync
};

const u$2 = universalify$1.fromCallback;
const fs$6 = gracefulFs;
const path$3 = require$$1__default["default"];
const mkdir = mkdirs$2;
const pathExists$1 = pathExists_1.pathExists;

function outputFile$1 (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  const dir = path$3.dirname(file);
  pathExists$1(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return fs$6.writeFile(file, data, encoding, callback)

    mkdir.mkdirs(dir, err => {
      if (err) return callback(err)

      fs$6.writeFile(file, data, encoding, callback);
    });
  });
}

function outputFileSync$1 (file, ...args) {
  const dir = path$3.dirname(file);
  if (fs$6.existsSync(dir)) {
    return fs$6.writeFileSync(file, ...args)
  }
  mkdir.mkdirsSync(dir);
  fs$6.writeFileSync(file, ...args);
}

var outputFile_1 = {
  outputFile: u$2(outputFile$1),
  outputFileSync: outputFileSync$1
};

const { stringify: stringify$1 } = utils;
const { outputFile } = outputFile_1;

async function outputJson (file, data, options = {}) {
  const str = stringify$1(data, options);

  await outputFile(file, str, options);
}

var outputJson_1 = outputJson;

const { stringify } = utils;
const { outputFileSync } = outputFile_1;

function outputJsonSync (file, data, options) {
  const str = stringify(data, options);

  outputFileSync(file, str, options);
}

var outputJsonSync_1 = outputJsonSync;

const u$1 = universalify$1.fromPromise;
const jsonFile = jsonfile;

jsonFile.outputJson = u$1(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
// aliases
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;

var json = jsonFile;

const fs$5 = gracefulFs;
const path$2 = require$$1__default["default"];
const copy = copy$1.copy;
const remove = remove_1.remove;
const mkdirp = mkdirs$2.mkdirp;
const pathExists = pathExists_1.pathExists;
const stat$1 = stat$4;

function move$1 (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};

  const overwrite = opts.overwrite || opts.clobber || false;

  stat$1.checkPaths(src, dest, 'move', opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, isChangingCase = false } = stats;
    stat$1.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      if (isParentRoot$1(dest)) return doRename$1(src, dest, overwrite, isChangingCase, cb)
      mkdirp(path$2.dirname(dest), err => {
        if (err) return cb(err)
        return doRename$1(src, dest, overwrite, isChangingCase, cb)
      });
    });
  });
}

function isParentRoot$1 (dest) {
  const parent = path$2.dirname(dest);
  const parsedPath = path$2.parse(parent);
  return parsedPath.root === parent
}

function doRename$1 (src, dest, overwrite, isChangingCase, cb) {
  if (isChangingCase) return rename$1(src, dest, overwrite, cb)
  if (overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename$1(src, dest, overwrite, cb)
    })
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename$1(src, dest, overwrite, cb)
  });
}

function rename$1 (src, dest, overwrite, cb) {
  fs$5.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice$1(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice$1 (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  });
}

var move_1 = move$1;

const fs$4 = gracefulFs;
const path$1 = require$$1__default["default"];
const copySync = copy$1.copySync;
const removeSync = remove_1.removeSync;
const mkdirpSync = mkdirs$2.mkdirpSync;
const stat = stat$4;

function moveSync (src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;

  const { srcStat, isChangingCase = false } = stat.checkPathsSync(src, dest, 'move', opts);
  stat.checkParentPathsSync(src, srcStat, dest, 'move');
  if (!isParentRoot(dest)) mkdirpSync(path$1.dirname(dest));
  return doRename(src, dest, overwrite, isChangingCase)
}

function isParentRoot (dest) {
  const parent = path$1.dirname(dest);
  const parsedPath = path$1.parse(parent);
  return parsedPath.root === parent
}

function doRename (src, dest, overwrite, isChangingCase) {
  if (isChangingCase) return rename(src, dest, overwrite)
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite)
  }
  if (fs$4.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    fs$4.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync(src, dest, opts);
  return removeSync(src)
}

var moveSync_1 = moveSync;

const u = universalify$1.fromCallback;
var move = {
  move: u(move_1),
  moveSync: moveSync_1
};

var lib = {
  // Export promiseified graceful-fs:
  ...fs$m,
  // Export extra methods:
  ...copy$1,
  ...empty,
  ...ensure,
  ...json,
  ...mkdirs$2,
  ...move,
  ...outputFile_1,
  ...pathExists_1,
  ...remove_1
};

var src = {exports: {}};

var browser$1 = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser$1;

function requireBrowser$1 () {
	if (hasRequiredBrowser$1) return browser$1.exports;
	hasRequiredBrowser$1 = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug');
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		};
} (browser$1, browser$1.exports));
	return browser$1.exports;
}

var node = {exports: {}};

/* eslint-env browser */

var browser;
var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser;
	hasRequiredBrowser = 1;

	function getChromeVersion() {
		const matches = /(Chrome|Chromium)\/(?<chromeVersion>\d+)\./.exec(navigator.userAgent);

		if (!matches) {
			return;
		}

		return Number.parseInt(matches.groups.chromeVersion, 10);
	}

	const colorSupport = getChromeVersion() >= 69 ? {
		level: 1,
		hasBasic: true,
		has256: false,
		has16m: false
	} : false;

	browser = {
		stdout: colorSupport,
		stderr: colorSupport
	};
	return browser;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$0__default$2["default"];
		const util = require$$4__default["default"];

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireBrowser();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.format(...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		};
} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

(function (module) {
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		module.exports = requireBrowser$1();
	} else {
		module.exports = requireNode();
	}
} (src));

var getStream$2 = {exports: {}};

var once$3 = {exports: {}};

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
var wrappy_1 = wrappy$1;
function wrappy$1 (fn, cb) {
  if (fn && cb) return wrappy$1(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length-1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret
  }
}

var wrappy = wrappy_1;
once$3.exports = wrappy(once$2);
once$3.exports.strict = wrappy(onceStrict);

once$2.proto = once$2(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once$2(this)
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  });
});

function once$2 (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  f.called = false;
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f
}

var once$1 = once$3.exports;

var noop$1 = function() {};

var isRequest$1 = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos$1 = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos$1(stream, null, opts);
	if (!opts) opts = {};

	callback = once$1(callback || noop$1);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest$1(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream = eos$1;

var once = once$3.exports;
var eos = endOfStream;
var fs$3 = require$$0__default$1["default"]; // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {};
var ancient = /^v?\.0/.test(process.version);

var isFn = function (fn) {
  return typeof fn === 'function'
};

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs$3) return false // browser
  return (stream instanceof (fs$3.ReadStream || noop) || stream instanceof (fs$3.WriteStream || noop)) && isFn(stream.close)
};

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
};

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback);

  var closed = false;
  stream.on('close', function () {
    closed = true;
  });

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true;
    callback();
  });

  var destroyed = false;
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true;

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'));
  }
};

var call = function (fn) {
  fn();
};

var pipe = function (from, to) {
  return from.pipe(to)
};

var pump$1 = function () {
  var streams = Array.prototype.slice.call(arguments);
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;

  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return
      destroys.forEach(call);
      callback(error);
    })
  });

  return streams.reduce(pipe)
};

var pump_1 = pump$1;

const {PassThrough: PassThroughStream} = require$$6__default["default"];

var bufferStream$1 = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};

const {constants: BufferConstants} = require$$0__default$3["default"];
const pump = pump_1;
const bufferStream = bufferStream$1;

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream$1(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	let stream;
	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			// Don't retrieve an oversized buffer.
			if (error && stream.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

getStream$2.exports = getStream$1;
// TODO: Remove this for the next major release
getStream$2.exports.default = getStream$1;
getStream$2.exports.buffer = (stream, options) => getStream$1(stream, {...options, encoding: 'buffer'});
getStream$2.exports.array = (stream, options) => getStream$1(stream, {...options, array: true});
getStream$2.exports.MaxBufferError = MaxBufferError;

var yauzl$1 = {};

var fdSlicer = {};

var pend = Pend$1;

function Pend$1() {
  this.pending = 0;
  this.max = Infinity;
  this.listeners = [];
  this.waiting = [];
  this.error = null;
}

Pend$1.prototype.go = function(fn) {
  if (this.pending < this.max) {
    pendGo(this, fn);
  } else {
    this.waiting.push(fn);
  }
};

Pend$1.prototype.wait = function(cb) {
  if (this.pending === 0) {
    cb(this.error);
  } else {
    this.listeners.push(cb);
  }
};

Pend$1.prototype.hold = function() {
  return pendHold(this);
};

function pendHold(self) {
  self.pending += 1;
  var called = false;
  return onCb;
  function onCb(err) {
    if (called) throw new Error("callback called twice");
    called = true;
    self.error = self.error || err;
    self.pending -= 1;
    if (self.waiting.length > 0 && self.pending < self.max) {
      pendGo(self, self.waiting.shift());
    } else if (self.pending === 0) {
      var listeners = self.listeners;
      self.listeners = [];
      listeners.forEach(cbListener);
    }
  }
  function cbListener(listener) {
    listener(self.error);
  }
}

function pendGo(self, fn) {
  fn(pendHold(self));
}

var fs$2 = require$$0__default$1["default"];
var util$1 = require$$4__default["default"];
var stream$1 = require$$6__default["default"];
var Readable = stream$1.Readable;
var Writable$1 = stream$1.Writable;
var PassThrough$1 = stream$1.PassThrough;
var Pend = pend;
var EventEmitter$1 = require$$4__default$1["default"].EventEmitter;

fdSlicer.createFromBuffer = createFromBuffer;
fdSlicer.createFromFd = createFromFd;
fdSlicer.BufferSlicer = BufferSlicer;
fdSlicer.FdSlicer = FdSlicer;

util$1.inherits(FdSlicer, EventEmitter$1);
function FdSlicer(fd, options) {
  options = options || {};
  EventEmitter$1.call(this);

  this.fd = fd;
  this.pend = new Pend();
  this.pend.max = 1;
  this.refCount = 0;
  this.autoClose = !!options.autoClose;
}

FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs$2.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer) {
      cb();
      callback(err, bytesRead, buffer);
    });
  });
};

FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs$2.write(self.fd, buffer, offset, length, position, function(err, written, buffer) {
      cb();
      callback(err, written, buffer);
    });
  });
};

FdSlicer.prototype.createReadStream = function(options) {
  return new ReadStream(this, options);
};

FdSlicer.prototype.createWriteStream = function(options) {
  return new WriteStream(this, options);
};

FdSlicer.prototype.ref = function() {
  this.refCount += 1;
};

FdSlicer.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  if (self.autoClose) {
    fs$2.close(self.fd, onCloseDone);
  }

  function onCloseDone(err) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('close');
    }
  }
};

util$1.inherits(ReadStream, Readable);
function ReadStream(context, options) {
  options = options || {};
  Readable.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = options.end;
  this.pos = this.start;
  this.destroyed = false;
}

ReadStream.prototype._read = function(n) {
  var self = this;
  if (self.destroyed) return;

  var toRead = Math.min(self._readableState.highWaterMark, n);
  if (self.endOffset != null) {
    toRead = Math.min(toRead, self.endOffset - self.pos);
  }
  if (toRead <= 0) {
    self.destroyed = true;
    self.push(null);
    self.context.unref();
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    var buffer = new Buffer(toRead);
    fs$2.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
      if (err) {
        self.destroy(err);
      } else if (bytesRead === 0) {
        self.destroyed = true;
        self.push(null);
        self.context.unref();
      } else {
        self.pos += bytesRead;
        self.push(buffer.slice(0, bytesRead));
      }
      cb();
    });
  });
};

ReadStream.prototype.destroy = function(err) {
  if (this.destroyed) return;
  err = err || new Error("stream destroyed");
  this.destroyed = true;
  this.emit('error', err);
  this.context.unref();
};

util$1.inherits(WriteStream, Writable$1);
function WriteStream(context, options) {
  options = options || {};
  Writable$1.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = (options.end == null) ? Infinity : +options.end;
  this.bytesWritten = 0;
  this.pos = this.start;
  this.destroyed = false;

  this.on('finish', this.destroy.bind(this));
}

WriteStream.prototype._write = function(buffer, encoding, callback) {
  var self = this;
  if (self.destroyed) return;

  if (self.pos + buffer.length > self.endOffset) {
    var err = new Error("maximum file length exceeded");
    err.code = 'ETOOBIG';
    self.destroy();
    callback(err);
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    fs$2.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err, bytes) {
      if (err) {
        self.destroy();
        cb();
        callback(err);
      } else {
        self.bytesWritten += bytes;
        self.pos += bytes;
        self.emit('progress');
        cb();
        callback();
      }
    });
  });
};

WriteStream.prototype.destroy = function() {
  if (this.destroyed) return;
  this.destroyed = true;
  this.context.unref();
};

util$1.inherits(BufferSlicer, EventEmitter$1);
function BufferSlicer(buffer, options) {
  EventEmitter$1.call(this);

  options = options || {};
  this.refCount = 0;
  this.buffer = buffer;
  this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
}

BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var end = position + length;
  var delta = end - this.buffer.length;
  var written = (delta > 0) ? delta : length;
  this.buffer.copy(buffer, offset, position, end);
  setImmediate(function() {
    callback(null, written);
  });
};

BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  buffer.copy(this.buffer, position, offset, offset + length);
  setImmediate(function() {
    callback(null, length, buffer);
  });
};

BufferSlicer.prototype.createReadStream = function(options) {
  options = options || {};
  var readStream = new PassThrough$1(options);
  readStream.destroyed = false;
  readStream.start = options.start || 0;
  readStream.endOffset = options.end;
  // by the time this function returns, we'll be done.
  readStream.pos = readStream.endOffset || this.buffer.length;

  // respect the maxChunkSize option to slice up the chunk into smaller pieces.
  var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
  var offset = 0;
  while (true) {
    var nextOffset = offset + this.maxChunkSize;
    if (nextOffset >= entireSlice.length) {
      // last chunk
      if (offset < entireSlice.length) {
        readStream.write(entireSlice.slice(offset, entireSlice.length));
      }
      break;
    }
    readStream.write(entireSlice.slice(offset, nextOffset));
    offset = nextOffset;
  }

  readStream.end();
  readStream.destroy = function() {
    readStream.destroyed = true;
  };
  return readStream;
};

BufferSlicer.prototype.createWriteStream = function(options) {
  var bufferSlicer = this;
  options = options || {};
  var writeStream = new Writable$1(options);
  writeStream.start = options.start || 0;
  writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end;
  writeStream.bytesWritten = 0;
  writeStream.pos = writeStream.start;
  writeStream.destroyed = false;
  writeStream._write = function(buffer, encoding, callback) {
    if (writeStream.destroyed) return;

    var end = writeStream.pos + buffer.length;
    if (end > writeStream.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = 'ETOOBIG';
      writeStream.destroyed = true;
      callback(err);
      return;
    }
    buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);

    writeStream.bytesWritten += buffer.length;
    writeStream.pos = end;
    writeStream.emit('progress');
    callback();
  };
  writeStream.destroy = function() {
    writeStream.destroyed = true;
  };
  return writeStream;
};

BufferSlicer.prototype.ref = function() {
  this.refCount += 1;
};

BufferSlicer.prototype.unref = function() {
  this.refCount -= 1;

  if (this.refCount < 0) {
    throw new Error("invalid unref");
  }
};

function createFromBuffer(buffer, options) {
  return new BufferSlicer(buffer, options);
}

function createFromFd(fd, options) {
  return new FdSlicer(fd, options);
}

var Buffer$1 = require$$0__default$3["default"].Buffer;

var CRC_TABLE = [
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
  0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4,
  0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07,
  0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
  0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856,
  0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
  0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4,
  0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
  0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
  0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a,
  0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599,
  0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
  0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190,
  0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f,
  0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e,
  0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
  0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed,
  0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
  0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3,
  0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
  0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a,
  0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5,
  0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010,
  0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
  0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17,
  0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6,
  0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
  0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
  0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344,
  0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
  0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a,
  0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
  0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1,
  0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c,
  0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef,
  0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
  0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe,
  0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31,
  0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c,
  0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
  0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b,
  0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
  0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1,
  0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
  0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
  0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7,
  0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66,
  0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
  0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605,
  0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8,
  0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b,
  0x2d02ef8d
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer$1.isBuffer(input)) {
    return input;
  }

  var hasNewBufferAPI =
      typeof Buffer$1.alloc === "function" &&
      typeof Buffer$1.from === "function";

  if (typeof input === "number") {
    return hasNewBufferAPI ? Buffer$1.alloc(input) : new Buffer$1(input);
  }
  else if (typeof input === "string") {
    return hasNewBufferAPI ? Buffer$1.from(input) : new Buffer$1(input);
  }
  else {
    throw new Error("input must be buffer, number, or string, received " +
                    typeof input);
  }
}

function bufferizeInt(num) {
  var tmp = ensureBuffer(4);
  tmp.writeInt32BE(num, 0);
  return tmp;
}

function _crc32(buf, previous) {
  buf = ensureBuffer(buf);
  if (Buffer$1.isBuffer(previous)) {
    previous = previous.readUInt32BE(0);
  }
  var crc = ~~previous ^ -1;
  for (var n = 0; n < buf.length; n++) {
    crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

function crc32$1() {
  return bufferizeInt(_crc32.apply(null, arguments));
}
crc32$1.signed = function () {
  return _crc32.apply(null, arguments);
};
crc32$1.unsigned = function () {
  return _crc32.apply(null, arguments) >>> 0;
};

var bufferCrc32 = crc32$1;

var fs$1 = require$$0__default$1["default"];
var zlib = require$$1__default$1["default"];
var fd_slicer = fdSlicer;
var crc32 = bufferCrc32;
var util = require$$4__default["default"];
var EventEmitter = require$$4__default$1["default"].EventEmitter;
var Transform = require$$6__default["default"].Transform;
var PassThrough = require$$6__default["default"].PassThrough;
var Writable = require$$6__default["default"].Writable;

yauzl$1.open = open;
yauzl$1.fromFd = fromFd;
yauzl$1.fromBuffer = fromBuffer;
yauzl$1.fromRandomAccessReader = fromRandomAccessReader;
yauzl$1.dosDateTimeToDate = dosDateTimeToDate;
yauzl$1.validateFileName = validateFileName;
yauzl$1.ZipFile = ZipFile;
yauzl$1.Entry = Entry;
yauzl$1.RandomAccessReader = RandomAccessReader;

function open(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs$1.open(path, "r", function(err, fd) {
    if (err) return callback(err);
    fromFd(fd, options, function(err, zipfile) {
      if (err) fs$1.close(fd, defaultCallback);
      callback(err, zipfile);
    });
  });
}

function fromFd(fd, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs$1.fstat(fd, function(err, stats) {
    if (err) return callback(err);
    var reader = fd_slicer.createFromFd(fd, {autoClose: true});
    fromRandomAccessReader(reader, stats.size, options, callback);
  });
}

function fromBuffer(buffer, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  // limit the max chunk size. see https://github.com/thejoshwolfe/yauzl/issues/87
  var reader = fd_slicer.createFromBuffer(buffer, {maxChunkSize: 0x10000});
  fromRandomAccessReader(reader, buffer.length, options, callback);
}

function fromRandomAccessReader(reader, totalSize, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  var decodeStrings = !!options.decodeStrings;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
  if (totalSize > Number.MAX_SAFE_INTEGER) {
    throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
  }

  // the matching unref() call is in zipfile.close()
  reader.ref();

  // eocdr means End of Central Directory Record.
  // search backwards for the eocdr signature.
  // the last field of the eocdr is a variable-length comment.
  // the comment size is encoded in a 2-byte field in the eocdr, which we can't find without trudging backwards through the comment to find it.
  // as a consequence of this design decision, it's possible to have ambiguous zip file metadata if a coherent eocdr was in the comment.
  // we search backwards for a eocdr signature, and hope that whoever made the zip file was smart enough to forbid the eocdr signature in the comment.
  var eocdrWithoutCommentSize = 22;
  var maxCommentSize = 0xffff; // 2-byte size
  var bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize);
  var buffer = newBuffer(bufferSize);
  var bufferReadStart = totalSize - buffer.length;
  readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
    if (err) return callback(err);
    for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
      if (buffer.readUInt32LE(i) !== 0x06054b50) continue;
      // found eocdr
      var eocdrBuffer = buffer.slice(i);

      // 0 - End of central directory signature = 0x06054b50
      // 4 - Number of this disk
      var diskNumber = eocdrBuffer.readUInt16LE(4);
      if (diskNumber !== 0) {
        return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
      }
      // 6 - Disk where central directory starts
      // 8 - Number of central directory records on this disk
      // 10 - Total number of central directory records
      var entryCount = eocdrBuffer.readUInt16LE(10);
      // 12 - Size of central directory (bytes)
      // 16 - Offset of start of central directory, relative to start of archive
      var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
      // 20 - Comment length
      var commentLength = eocdrBuffer.readUInt16LE(20);
      var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
      if (commentLength !== expectedCommentLength) {
        return callback(new Error("invalid comment length. expected: " + expectedCommentLength + ". found: " + commentLength));
      }
      // 22 - Comment
      // the encoding is always cp437.
      var comment = decodeStrings ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false)
                                  : eocdrBuffer.slice(22);

      if (!(entryCount === 0xffff || centralDirectoryOffset === 0xffffffff)) {
        return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
      }

      // ZIP64 format

      // ZIP64 Zip64 end of central directory locator
      var zip64EocdlBuffer = newBuffer(20);
      var zip64EocdlOffset = bufferReadStart + i - zip64EocdlBuffer.length;
      readAndAssertNoEof(reader, zip64EocdlBuffer, 0, zip64EocdlBuffer.length, zip64EocdlOffset, function(err) {
        if (err) return callback(err);

        // 0 - zip64 end of central dir locator signature = 0x07064b50
        if (zip64EocdlBuffer.readUInt32LE(0) !== 0x07064b50) {
          return callback(new Error("invalid zip64 end of central directory locator signature"));
        }
        // 4 - number of the disk with the start of the zip64 end of central directory
        // 8 - relative offset of the zip64 end of central directory record
        var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
        // 16 - total number of disks

        // ZIP64 end of central directory record
        var zip64EocdrBuffer = newBuffer(56);
        readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err) {
          if (err) return callback(err);

          // 0 - zip64 end of central dir signature                           4 bytes  (0x06064b50)
          if (zip64EocdrBuffer.readUInt32LE(0) !== 0x06064b50) {
            return callback(new Error("invalid zip64 end of central directory record signature"));
          }
          // 4 - size of zip64 end of central directory record                8 bytes
          // 12 - version made by                                             2 bytes
          // 14 - version needed to extract                                   2 bytes
          // 16 - number of this disk                                         4 bytes
          // 20 - number of the disk with the start of the central directory  4 bytes
          // 24 - total number of entries in the central directory on this disk         8 bytes
          // 32 - total number of entries in the central directory            8 bytes
          entryCount = readUInt64LE(zip64EocdrBuffer, 32);
          // 40 - size of the central directory                               8 bytes
          // 48 - offset of start of central directory with respect to the starting disk number     8 bytes
          centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
          // 56 - zip64 extensible data sector                                (variable size)
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
        });
      });
      return;
    }
    callback(new Error("end of central directory record signature not found"));
  });
}

util.inherits(ZipFile, EventEmitter);
function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
  var self = this;
  EventEmitter.call(self);
  self.reader = reader;
  // forward close events
  self.reader.on("error", function(err) {
    // error closing the fd
    emitError(self, err);
  });
  self.reader.once("close", function() {
    self.emit("close");
  });
  self.readEntryCursor = centralDirectoryOffset;
  self.fileSize = fileSize;
  self.entryCount = entryCount;
  self.comment = comment;
  self.entriesRead = 0;
  self.autoClose = !!autoClose;
  self.lazyEntries = !!lazyEntries;
  self.decodeStrings = !!decodeStrings;
  self.validateEntrySizes = !!validateEntrySizes;
  self.strictFileNames = !!strictFileNames;
  self.isOpen = true;
  self.emittedError = false;

  if (!self.lazyEntries) self._readEntry();
}
ZipFile.prototype.close = function() {
  if (!this.isOpen) return;
  this.isOpen = false;
  this.reader.unref();
};

function emitErrorAndAutoClose(self, err) {
  if (self.autoClose) self.close();
  emitError(self, err);
}
function emitError(self, err) {
  if (self.emittedError) return;
  self.emittedError = true;
  self.emit("error", err);
}

ZipFile.prototype.readEntry = function() {
  if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
  this._readEntry();
};
ZipFile.prototype._readEntry = function() {
  var self = this;
  if (self.entryCount === self.entriesRead) {
    // done with metadata
    setImmediate(function() {
      if (self.autoClose) self.close();
      if (self.emittedError) return;
      self.emit("end");
    });
    return;
  }
  if (self.emittedError) return;
  var buffer = newBuffer(46);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
    if (err) return emitErrorAndAutoClose(self, err);
    if (self.emittedError) return;
    var entry = new Entry();
    // 0 - Central directory file header signature
    var signature = buffer.readUInt32LE(0);
    if (signature !== 0x02014b50) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
    // 4 - Version made by
    entry.versionMadeBy = buffer.readUInt16LE(4);
    // 6 - Version needed to extract (minimum)
    entry.versionNeededToExtract = buffer.readUInt16LE(6);
    // 8 - General purpose bit flag
    entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
    // 10 - Compression method
    entry.compressionMethod = buffer.readUInt16LE(10);
    // 12 - File last modification time
    entry.lastModFileTime = buffer.readUInt16LE(12);
    // 14 - File last modification date
    entry.lastModFileDate = buffer.readUInt16LE(14);
    // 16 - CRC-32
    entry.crc32 = buffer.readUInt32LE(16);
    // 20 - Compressed size
    entry.compressedSize = buffer.readUInt32LE(20);
    // 24 - Uncompressed size
    entry.uncompressedSize = buffer.readUInt32LE(24);
    // 28 - File name length (n)
    entry.fileNameLength = buffer.readUInt16LE(28);
    // 30 - Extra field length (m)
    entry.extraFieldLength = buffer.readUInt16LE(30);
    // 32 - File comment length (k)
    entry.fileCommentLength = buffer.readUInt16LE(32);
    // 34 - Disk number where file starts
    // 36 - Internal file attributes
    entry.internalFileAttributes = buffer.readUInt16LE(36);
    // 38 - External file attributes
    entry.externalFileAttributes = buffer.readUInt32LE(38);
    // 42 - Relative offset of local file header
    entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);

    if (entry.generalPurposeBitFlag & 0x40) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));

    self.readEntryCursor += 46;

    buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
      if (err) return emitErrorAndAutoClose(self, err);
      if (self.emittedError) return;
      // 46 - File name
      var isUtf8 = (entry.generalPurposeBitFlag & 0x800) !== 0;
      entry.fileName = self.decodeStrings ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8)
                                          : buffer.slice(0, entry.fileNameLength);

      // 46+n - Extra field
      var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
      var extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart);
      entry.extraFields = [];
      var i = 0;
      while (i < extraFieldBuffer.length - 3) {
        var headerId = extraFieldBuffer.readUInt16LE(i + 0);
        var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
        var dataStart = i + 4;
        var dataEnd = dataStart + dataSize;
        if (dataEnd > extraFieldBuffer.length) return emitErrorAndAutoClose(self, new Error("extra field length exceeds extra field buffer size"));
        var dataBuffer = newBuffer(dataSize);
        extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd);
        entry.extraFields.push({
          id: headerId,
          data: dataBuffer,
        });
        i = dataEnd;
      }

      // 46+n+m - File comment
      entry.fileComment = self.decodeStrings ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8)
                                             : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength);
      // compatibility hack for https://github.com/thejoshwolfe/yauzl/issues/47
      entry.comment = entry.fileComment;

      self.readEntryCursor += buffer.length;
      self.entriesRead += 1;

      if (entry.uncompressedSize            === 0xffffffff ||
          entry.compressedSize              === 0xffffffff ||
          entry.relativeOffsetOfLocalHeader === 0xffffffff) {
        // ZIP64 format
        // find the Zip64 Extended Information Extra Field
        var zip64EiefBuffer = null;
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x0001) {
            zip64EiefBuffer = extraField.data;
            break;
          }
        }
        if (zip64EiefBuffer == null) {
          return emitErrorAndAutoClose(self, new Error("expected zip64 extended information extra field"));
        }
        var index = 0;
        // 0 - Original Size          8 bytes
        if (entry.uncompressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
          }
          entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 8 - Compressed Size        8 bytes
        if (entry.compressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
          }
          entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 16 - Relative Header Offset 8 bytes
        if (entry.relativeOffsetOfLocalHeader === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
          }
          entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 24 - Disk Start Number      4 bytes
      }

      // check for Info-ZIP Unicode Path Extra Field (0x7075)
      // see https://github.com/thejoshwolfe/yauzl/issues/33
      if (self.decodeStrings) {
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x7075) {
            if (extraField.data.length < 6) {
              // too short to be meaningful
              continue;
            }
            // Version       1 byte      version of this extra field, currently 1
            if (extraField.data.readUInt8(0) !== 1) {
              // > Changes may not be backward compatible so this extra
              // > field should not be used if the version is not recognized.
              continue;
            }
            // NameCRC32     4 bytes     File Name Field CRC32 Checksum
            var oldNameCrc32 = extraField.data.readUInt32LE(1);
            if (crc32.unsigned(buffer.slice(0, entry.fileNameLength)) !== oldNameCrc32) {
              // > If the CRC check fails, this UTF-8 Path Extra Field should be
              // > ignored and the File Name field in the header should be used instead.
              continue;
            }
            // UnicodeName   Variable    UTF-8 version of the entry File Name
            entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true);
            break;
          }
        }
      }

      // validate file size
      if (self.validateEntrySizes && entry.compressionMethod === 0) {
        var expectedCompressedSize = entry.uncompressedSize;
        if (entry.isEncrypted()) {
          // traditional encryption prefixes the file data with a header
          expectedCompressedSize += 12;
        }
        if (entry.compressedSize !== expectedCompressedSize) {
          var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
          return emitErrorAndAutoClose(self, new Error(msg));
        }
      }

      if (self.decodeStrings) {
        if (!self.strictFileNames) {
          // allow backslash
          entry.fileName = entry.fileName.replace(/\\/g, "/");
        }
        var errorMessage = validateFileName(entry.fileName, self.validateFileNameOptions);
        if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
      }
      self.emit("entry", entry);

      if (!self.lazyEntries) self._readEntry();
    });
  });
};

ZipFile.prototype.openReadStream = function(entry, options, callback) {
  var self = this;
  // parameter validation
  var relativeStart = 0;
  var relativeEnd = entry.compressedSize;
  if (callback == null) {
    callback = options;
    options = {};
  } else {
    // validate options that the caller has no excuse to get wrong
    if (options.decrypt != null) {
      if (!entry.isEncrypted()) {
        throw new Error("options.decrypt can only be specified for encrypted entries");
      }
      if (options.decrypt !== false) throw new Error("invalid options.decrypt value: " + options.decrypt);
      if (entry.isCompressed()) {
        if (options.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false");
      }
    }
    if (options.decompress != null) {
      if (!entry.isCompressed()) {
        throw new Error("options.decompress can only be specified for compressed entries");
      }
      if (!(options.decompress === false || options.decompress === true)) {
        throw new Error("invalid options.decompress value: " + options.decompress);
      }
    }
    if (options.start != null || options.end != null) {
      if (entry.isCompressed() && options.decompress !== false) {
        throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
      }
      if (entry.isEncrypted() && options.decrypt !== false) {
        throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
      }
    }
    if (options.start != null) {
      relativeStart = options.start;
      if (relativeStart < 0) throw new Error("options.start < 0");
      if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
    }
    if (options.end != null) {
      relativeEnd = options.end;
      if (relativeEnd < 0) throw new Error("options.end < 0");
      if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
      if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
    }
  }
  // any further errors can either be caused by the zipfile,
  // or were introduced in a minor version of yauzl,
  // so should be passed to the client rather than thrown.
  if (!self.isOpen) return callback(new Error("closed"));
  if (entry.isEncrypted()) {
    if (options.decrypt !== false) return callback(new Error("entry is encrypted, and options.decrypt !== false"));
  }
  // make sure we don't lose the fd before we open the actual read stream
  self.reader.ref();
  var buffer = newBuffer(30);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
    try {
      if (err) return callback(err);
      // 0 - Local file header signature = 0x04034b50
      var signature = buffer.readUInt32LE(0);
      if (signature !== 0x04034b50) {
        return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
      }
      // all this should be redundant
      // 4 - Version needed to extract (minimum)
      // 6 - General purpose bit flag
      // 8 - Compression method
      // 10 - File last modification time
      // 12 - File last modification date
      // 14 - CRC-32
      // 18 - Compressed size
      // 22 - Uncompressed size
      // 26 - File name length (n)
      var fileNameLength = buffer.readUInt16LE(26);
      // 28 - Extra field length (m)
      var extraFieldLength = buffer.readUInt16LE(28);
      // 30 - File name
      // 30+n - Extra field
      var localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
      var decompress;
      if (entry.compressionMethod === 0) {
        // 0 - The file is stored (no compression)
        decompress = false;
      } else if (entry.compressionMethod === 8) {
        // 8 - The file is Deflated
        decompress = options.decompress != null ? options.decompress : true;
      } else {
        return callback(new Error("unsupported compression method: " + entry.compressionMethod));
      }
      var fileDataStart = localFileHeaderEnd;
      var fileDataEnd = fileDataStart + entry.compressedSize;
      if (entry.compressedSize !== 0) {
        // bounds check now, because the read streams will probably not complain loud enough.
        // since we're dealing with an unsigned offset plus an unsigned size,
        // we only have 1 thing to check for.
        if (fileDataEnd > self.fileSize) {
          return callback(new Error("file data overflows file bounds: " +
              fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
        }
      }
      var readStream = self.reader.createReadStream({
        start: fileDataStart + relativeStart,
        end: fileDataStart + relativeEnd,
      });
      var endpointStream = readStream;
      if (decompress) {
        var destroyed = false;
        var inflateFilter = zlib.createInflateRaw();
        readStream.on("error", function(err) {
          // setImmediate here because errors can be emitted during the first call to pipe()
          setImmediate(function() {
            if (!destroyed) inflateFilter.emit("error", err);
          });
        });
        readStream.pipe(inflateFilter);

        if (self.validateEntrySizes) {
          endpointStream = new AssertByteCountStream(entry.uncompressedSize);
          inflateFilter.on("error", function(err) {
            // forward zlib errors to the client-visible stream
            setImmediate(function() {
              if (!destroyed) endpointStream.emit("error", err);
            });
          });
          inflateFilter.pipe(endpointStream);
        } else {
          // the zlib filter is the client-visible stream
          endpointStream = inflateFilter;
        }
        // this is part of yauzl's API, so implement this function on the client-visible stream
        endpointStream.destroy = function() {
          destroyed = true;
          if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
          readStream.unpipe(inflateFilter);
          // TODO: the inflateFilter may cause a memory leak. see Issue #27.
          readStream.destroy();
        };
      }
      callback(null, endpointStream);
    } finally {
      self.reader.unref();
    }
  });
};

function Entry() {
}
Entry.prototype.getLastModDate = function() {
  return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime);
};
Entry.prototype.isEncrypted = function() {
  return (this.generalPurposeBitFlag & 0x1) !== 0;
};
Entry.prototype.isCompressed = function() {
  return this.compressionMethod === 8;
};

function dosDateTimeToDate(date, time) {
  var day = date & 0x1f; // 1-31
  var month = (date >> 5 & 0xf) - 1; // 1-12, 0-11
  var year = (date >> 9 & 0x7f) + 1980; // 0-128, 1980-2108

  var millisecond = 0;
  var second = (time & 0x1f) * 2; // 0-29, 0-58 (even numbers)
  var minute = time >> 5 & 0x3f; // 0-59
  var hour = time >> 11 & 0x1f; // 0-23

  return new Date(year, month, day, hour, minute, second, millisecond);
}

function validateFileName(fileName) {
  if (fileName.indexOf("\\") !== -1) {
    return "invalid characters in fileName: " + fileName;
  }
  if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
    return "absolute path: " + fileName;
  }
  if (fileName.split("/").indexOf("..") !== -1) {
    return "invalid relative path: " + fileName;
  }
  // all good
  return null;
}

function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
  if (length === 0) {
    // fs.read will throw an out-of-bounds error if you try to read 0 bytes from a 0 byte file
    return setImmediate(function() { callback(null, newBuffer(0)); });
  }
  reader.read(buffer, offset, length, position, function(err, bytesRead) {
    if (err) return callback(err);
    if (bytesRead < length) {
      return callback(new Error("unexpected EOF"));
    }
    callback();
  });
}

util.inherits(AssertByteCountStream, Transform);
function AssertByteCountStream(byteCount) {
  Transform.call(this);
  this.actualByteCount = 0;
  this.expectedByteCount = byteCount;
}
AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
  this.actualByteCount += chunk.length;
  if (this.actualByteCount > this.expectedByteCount) {
    var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb(null, chunk);
};
AssertByteCountStream.prototype._flush = function(cb) {
  if (this.actualByteCount < this.expectedByteCount) {
    var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb();
};

util.inherits(RandomAccessReader, EventEmitter);
function RandomAccessReader() {
  EventEmitter.call(this);
  this.refCount = 0;
}
RandomAccessReader.prototype.ref = function() {
  this.refCount += 1;
};
RandomAccessReader.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  self.close(onCloseDone);

  function onCloseDone(err) {
    if (err) return self.emit('error', err);
    self.emit('close');
  }
};
RandomAccessReader.prototype.createReadStream = function(options) {
  var start = options.start;
  var end = options.end;
  if (start === end) {
    var emptyStream = new PassThrough();
    setImmediate(function() {
      emptyStream.end();
    });
    return emptyStream;
  }
  var stream = this._readStreamForRange(start, end);

  var destroyed = false;
  var refUnrefFilter = new RefUnrefFilter(this);
  stream.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) refUnrefFilter.emit("error", err);
    });
  });
  refUnrefFilter.destroy = function() {
    stream.unpipe(refUnrefFilter);
    refUnrefFilter.unref();
    stream.destroy();
  };

  var byteCounter = new AssertByteCountStream(end - start);
  refUnrefFilter.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) byteCounter.emit("error", err);
    });
  });
  byteCounter.destroy = function() {
    destroyed = true;
    refUnrefFilter.unpipe(byteCounter);
    refUnrefFilter.destroy();
  };

  return stream.pipe(refUnrefFilter).pipe(byteCounter);
};
RandomAccessReader.prototype._readStreamForRange = function(start, end) {
  throw new Error("not implemented");
};
RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
  var readStream = this.createReadStream({start: position, end: position + length});
  var writeStream = new Writable();
  var written = 0;
  writeStream._write = function(chunk, encoding, cb) {
    chunk.copy(buffer, offset + written, 0, chunk.length);
    written += chunk.length;
    cb();
  };
  writeStream.on("finish", callback);
  readStream.on("error", function(error) {
    callback(error);
  });
  readStream.pipe(writeStream);
};
RandomAccessReader.prototype.close = function(callback) {
  setImmediate(callback);
};

util.inherits(RefUnrefFilter, PassThrough);
function RefUnrefFilter(context) {
  PassThrough.call(this);
  this.context = context;
  this.context.ref();
  this.unreffedYet = false;
}
RefUnrefFilter.prototype._flush = function(cb) {
  this.unref();
  cb();
};
RefUnrefFilter.prototype.unref = function(cb) {
  if (this.unreffedYet) return;
  this.unreffedYet = true;
  this.context.unref();
};

var cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
function decodeBuffer(buffer, start, end, isUtf8) {
  if (isUtf8) {
    return buffer.toString("utf8", start, end);
  } else {
    var result = "";
    for (var i = start; i < end; i++) {
      result += cp437[buffer[i]];
    }
    return result;
  }
}

function readUInt64LE(buffer, offset) {
  // there is no native function for this, because we can't actually store 64-bit integers precisely.
  // after 53 bits, JavaScript's Number type (IEEE 754 double) can't store individual integers anymore.
  // but since 53 bits is a whole lot more than 32 bits, we do our best anyway.
  var lower32 = buffer.readUInt32LE(offset);
  var upper32 = buffer.readUInt32LE(offset + 4);
  // we can't use bitshifting here, because JavaScript bitshifting only works on 32-bit integers.
  return upper32 * 0x100000000 + lower32;
  // as long as we're bounds checking the result of this function against the total file size,
  // we'll catch any overflow errors, because we already made sure the total file size was within reason.
}

// Node 10 deprecated new Buffer().
var newBuffer;
if (typeof Buffer.allocUnsafe === "function") {
  newBuffer = function(len) {
    return Buffer.allocUnsafe(len);
  };
} else {
  newBuffer = function(len) {
    return new Buffer(len);
  };
}

function defaultCallback(err) {
  if (err) throw err;
}

const debug = src.exports('extract-zip');
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { createWriteStream, promises: fs } = require$$0__default$1["default"];
const getStream = getStream$2.exports;
const path = require$$1__default["default"];
const { promisify } = require$$4__default["default"];
const stream = require$$6__default["default"];
const yauzl = yauzl$1;

const openZip = promisify(yauzl.open);
const pipeline = promisify(stream.pipeline);

class Extractor {
  constructor (zipPath, opts) {
    this.zipPath = zipPath;
    this.opts = opts;
  }

  async extract () {
    debug('opening', this.zipPath, 'with opts', this.opts);

    this.zipfile = await openZip(this.zipPath, { lazyEntries: true });
    this.canceled = false;

    return new Promise((resolve, reject) => {
      this.zipfile.on('error', err => {
        this.canceled = true;
        reject(err);
      });
      this.zipfile.readEntry();

      this.zipfile.on('close', () => {
        if (!this.canceled) {
          debug('zip extraction complete');
          resolve();
        }
      });

      this.zipfile.on('entry', async entry => {
        /* istanbul ignore if */
        if (this.canceled) {
          debug('skipping entry', entry.fileName, { cancelled: this.canceled });
          return
        }

        debug('zipfile entry', entry.fileName);

        if (entry.fileName.startsWith('__MACOSX/')) {
          this.zipfile.readEntry();
          return
        }

        const destDir = path.dirname(path.join(this.opts.dir, entry.fileName));

        try {
          await fs.mkdir(destDir, { recursive: true });

          const canonicalDestDir = await fs.realpath(destDir);
          const relativeDestDir = path.relative(this.opts.dir, canonicalDestDir);

          if (relativeDestDir.split(path.sep).includes('..')) {
            throw new Error(`Out of bound path "${canonicalDestDir}" found while processing file ${entry.fileName}`)
          }

          await this.extractEntry(entry);
          debug('finished processing', entry.fileName);
          this.zipfile.readEntry();
        } catch (err) {
          this.canceled = true;
          this.zipfile.close();
          reject(err);
        }
      });
    })
  }

  async extractEntry (entry) {
    /* istanbul ignore if */
    if (this.canceled) {
      debug('skipping entry extraction', entry.fileName, { cancelled: this.canceled });
      return
    }

    if (this.opts.onEntry) {
      this.opts.onEntry(entry, this.zipfile);
    }

    const dest = path.join(this.opts.dir, entry.fileName);

    // convert external file attr int into a fs stat mode int
    const mode = (entry.externalFileAttributes >> 16) & 0xFFFF;
    // check if it's a symlink or dir (using stat mode constants)
    const IFMT = 61440;
    const IFDIR = 16384;
    const IFLNK = 40960;
    const symlink = (mode & IFMT) === IFLNK;
    let isDir = (mode & IFMT) === IFDIR;

    // Failsafe, borrowed from jsZip
    if (!isDir && entry.fileName.endsWith('/')) {
      isDir = true;
    }

    // check for windows weird way of specifying a directory
    // https://github.com/maxogden/extract-zip/issues/13#issuecomment-154494566
    const madeBy = entry.versionMadeBy >> 8;
    if (!isDir) isDir = (madeBy === 0 && entry.externalFileAttributes === 16);

    debug('extracting entry', { filename: entry.fileName, isDir: isDir, isSymlink: symlink });

    const procMode = this.getExtractedMode(mode, isDir) & 0o777;

    // always ensure folders are created
    const destDir = isDir ? dest : path.dirname(dest);

    const mkdirOptions = { recursive: true };
    if (isDir) {
      mkdirOptions.mode = procMode;
    }
    debug('mkdir', { dir: destDir, ...mkdirOptions });
    await fs.mkdir(destDir, mkdirOptions);
    if (isDir) return

    debug('opening read stream', dest);
    const readStream = await promisify(this.zipfile.openReadStream.bind(this.zipfile))(entry);

    if (symlink) {
      const link = await getStream(readStream);
      debug('creating symlink', link, dest);
      await fs.symlink(link, dest);
    } else {
      await pipeline(readStream, createWriteStream(dest, { mode: procMode }));
    }
  }

  getExtractedMode (entryMode, isDir) {
    let mode = entryMode;
    // Set defaults, if necessary
    if (mode === 0) {
      if (isDir) {
        if (this.opts.defaultDirMode) {
          mode = parseInt(this.opts.defaultDirMode, 10);
        }

        if (!mode) {
          mode = 0o755;
        }
      } else {
        if (this.opts.defaultFileMode) {
          mode = parseInt(this.opts.defaultFileMode, 10);
        }

        if (!mode) {
          mode = 0o644;
        }
      }
    }

    return mode
  }
}

var extractZip = async function (zipPath, opts) {
  debug('creating target directory', opts.dir);

  if (!path.isAbsolute(opts.dir)) {
    throw new Error('Target directory is expected to be absolute')
  }

  await fs.mkdir(opts.dir, { recursive: true });
  opts.dir = await fs.realpath(opts.dir);
  return new Extractor(zipPath, opts).extract()
};

var name = "electron-vite-template";
var version$1 = "1.0.0";
var main = "./dist/electron/main/main.js";
var author = "sky <https://github.com/umbrella22>";
var description = "electron-vite-template project";
var license = "MIT";
var scripts = {
	dev: "esno .electron-vite/dev-runner.ts",
	b: "electron-builder -c build.json",
	build: "cross-env BUILD_TARGET=clean esno .electron-vite/build.ts  && electron-builder -c build.json",
	"build:win32": "cross-env BUILD_TARGET=clean esno .electron-vite/build.ts  && electron-builder -c build.json --win  --ia32",
	"build:win64": "cross-env BUILD_TARGET=clean esno .electron-vite/build.ts  && electron-builder -c build.json --win  --x64",
	"build:mac": "cross-env BUILD_TARGET=clean esno .electron-vite/build.ts  && electron-builder -c build.json --mac",
	"build:dir": "cross-env BUILD_TARGET=clean esno .electron-vite/build.ts  && electron-builder -c build.json --dir",
	"build:clean": "cross-env BUILD_TARGET=onlyClean esno .electron-vite/build.ts",
	"build:web": "cross-env BUILD_TARGET=web esno .electron-vite/build.ts",
	"pack:resources": "esno .electron-vite/hot-updater.ts",
	"pack:rustUpdater": "electron_updater_node_cli -p -c updateConfig.json",
	"dep:upgrade": "yarn upgrade-interactive --latest",
	postinstall: "electron-builder install-app-deps"
};
var dependencies = {
	axios: "^0.27.2",
	"electron-log": "^4.4.8",
	"electron-updater": "^5.2.1",
	express: "^4.18.1",
	glob: "^8.0.3",
	semver: "^7.3.5"
};
var devDependencies = {
	"@rollup/plugin-alias": "^3.1.9",
	"@rollup/plugin-commonjs": "^22.0.2",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^13.3.0",
	"@rollup/plugin-replace": "^4.0.0",
	"@types/fs-extra": "^9.0.13",
	"@types/node": "^18.7.14",
	"@vitejs/plugin-vue": "^3.0.3",
	"@vitejs/plugin-vue-jsx": "^2.0.0",
	"@vue/compiler-sfc": "^3.2.38",
	"adm-zip": "^0.5.9",
	cfonts: "^3.1.1",
	chalk: "5.0.1",
	"cross-env": "^7.0.3",
	del: "^7.0.0",
	electron: "18.3.5",
	"electron-builder": "^23.3.3",
	"electron-devtools-vendor": "^1.1.0",
	electron_updater_node_cli: "^0.1.3",
	electron_updater_node_core: "^0.1.5",
	"element-plus": "^2.2.15",
	esno: "^0.16.3",
	"extract-zip": "^2.0.1",
	"fs-extra": "^10.1.0",
	"javascript-obfuscator": "^4.0.0",
	listr2: "^5.0.2",
	pinia: "^2.0.21",
	portfinder: "^1.0.32",
	"rollup-plugin-esbuild": "^4.10.1",
	"rollup-plugin-obfuscator": "^0.2.2",
	sass: "^1.54.7",
	tslib: "^2.4.0",
	typescript: "^4.8.2",
	vite: "^3.0.9",
	vue: "^3.2.38",
	"vue-i18n": "^9.2.2",
	"vue-router": "^4.1.5"
};
var encryptionLevel = 2;
var keywords = [
	"vite",
	"electron",
	"vue3",
	"rollup"
];
var packageInfo = {
	name: name,
	version: version$1,
	main: main,
	author: author,
	description: description,
	license: license,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies,
	encryptionLevel: encryptionLevel,
	keywords: keywords
};

const hotPublishConfig = {
  url: config.build.hotPublishUrl,
  configName: config.build.hotPublishConfigName
};

const streamPipeline = require$$4.promisify(require$$6.pipeline);
const appPath = electron.app.getAppPath();
const updatePath = require$$1.resolve(appPath, "..", "..", "update");
const request$1 = axios__default["default"].create();
function hash(data, type = "sha256", key = "Sky") {
  const hmac = crypto.createHmac(type, key);
  hmac.update(data);
  return hmac.digest("hex");
}
async function download(url, filePath) {
  const res = await request$1({ url, responseType: "stream" });
  await streamPipeline(res.data, lib.createWriteStream(filePath));
}
const updateInfo = {
  status: "init",
  message: ""
};
const updater$1 = async (windows) => {
  try {
    const res = await request$1({ url: `${hotPublishConfig.url}/${hotPublishConfig.configName}.json?time=${new Date().getTime()}` });
    if (!semver.gt(res.data.version, version$1))
      return;
    await lib.emptyDir(updatePath);
    const filePath = require$$1.join(updatePath, res.data.name);
    updateInfo.status = "downloading";
    if (windows)
      windows.webContents.send("hot-update-status", updateInfo);
    await download(`${hotPublishConfig.url}/${res.data.name}`, filePath);
    const buffer = await lib.readFile(filePath);
    const sha256 = hash(buffer);
    if (sha256 !== res.data.hash)
      throw new Error("sha256 error");
    const appPathTemp = require$$1.join(updatePath, "temp");
    await extractZip(filePath, { dir: appPathTemp });
    updateInfo.status = "moving";
    if (windows)
      windows.webContents.send("hot-update-status", updateInfo);
    await lib.remove(require$$1.join(`${appPath}`, "dist"));
    await lib.remove(require$$1.join(`${appPath}`, "package.json"));
    await lib.copy(appPathTemp, appPath);
    updateInfo.status = "finished";
    if (windows)
      windows.webContents.send("hot-update-status", updateInfo);
    require$$1.resolve("success");
  } catch (error) {
    updateInfo.status = "failed";
    updateInfo.message = error;
    if (windows)
      windows.webContents.send("hot-update-status", updateInfo);
  }
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */var d=function(e,t){return d=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);},d(e,t)};function g(e,t,r,n){return new(r||(r=Promise))((function(s,i){function o(e){try{h(n.next(e));}catch(e){i(e);}}function a(e){try{h(n.throw(e));}catch(e){i(e);}}function h(e){var t;e.done?s(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t);}))).then(o,a);}h((n=n.apply(e,t||[])).next());}))}function I(e,t){var r,n,s,i,o={label:0,sent:function(){if(1&s[0])throw s[1];return s[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(r)throw new TypeError("Generator is already executing.");for(;o;)try{if(r=1,n&&(s=2&i[0]?n.return:i[0]?n.throw||((s=n.return)&&s.call(n),0):n.next)&&!(s=s.call(n,i[1])).done)return s;switch(n=0,s&&(i=[2&i[0],s.value]),i[0]){case 0:case 1:s=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,n=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(s=o.trys,(s=s.length>0&&s[s.length-1])||6!==i[0]&&2!==i[0])){o=0;continue}if(3===i[0]&&(!s||i[1]>s[0]&&i[1]<s[3])){o.label=i[1];break}if(6===i[0]&&o.label<s[1]){o.label=s[1],s=i;break}if(s&&o.label<s[2]){o.label=s[2],o.ops.push(i);break}s[2]&&o.ops.pop(),o.trys.pop();continue}i=t.call(e,o);}catch(e){i=[6,e],n=0;}finally{r=s=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,a])}}}var m="object"==typeof process&&process&&"win32"===process.platform?{sep:"\\"}:{sep:"/"},R=N;function N(e,t,r){e instanceof RegExp&&(e=O(e,r)),t instanceof RegExp&&(t=O(t,r));var n=b(e,t,r);return n&&{start:n[0],end:n[1],pre:r.slice(0,n[0]),body:r.slice(n[0]+e.length,n[1]),post:r.slice(n[1]+t.length)}}function O(e,t){var r=t.match(e);return r?r[0]:null}function b(e,t,r){var n,s,i,o,a,h=r.indexOf(e),c=r.indexOf(t,h+1),l=h;if(h>=0&&c>0){if(e===t)return [h,c];for(n=[],i=r.length;l>=0&&!a;)l==h?(n.push(l),h=r.indexOf(e,l+1)):1==n.length?a=[n.pop(),c]:((s=n.pop())<i&&(i=s,o=c),c=r.indexOf(t,l+1)),l=h<c&&h>=0?h:c;n.length&&(a=[i,o]);}return a}N.range=b;var L=R,A=function(e){if(!e)return [];"{}"===e.substr(0,2)&&(e="\\{\\}"+e.substr(2));return G(function(e){return e.split("\\\\").join($).split("\\{").join(v).split("\\}").join(T).split("\\,").join(S).split("\\.").join(y)}(e),!0).map(P)},$="\0SLASH"+Math.random()+"\0",v="\0OPEN"+Math.random()+"\0",T="\0CLOSE"+Math.random()+"\0",S="\0COMMA"+Math.random()+"\0",y="\0PERIOD"+Math.random()+"\0";function w(e){return parseInt(e,10)==e?parseInt(e,10):e.charCodeAt(0)}function P(e){return e.split($).join("\\").split(v).join("{").split(T).join("}").split(S).join(",").split(y).join(".")}function D(e){if(!e)return [""];var t=[],r=L("{","}",e);if(!r)return e.split(",");var n=r.pre,s=r.body,i=r.post,o=n.split(",");o[o.length-1]+="{"+s+"}";var a=D(i);return i.length&&(o[o.length-1]+=a.shift(),o.push.apply(o,a)),t.push.apply(t,o),t}function j(e){return "{"+e+"}"}function M(e){return /^-?0\d/.test(e)}function x(e,t){return e<=t}function F(e,t){return e>=t}function G(e,t){var r=[],n=L("{","}",e);if(!n)return [e];var s=n.pre,i=n.post.length?G(n.post,!1):[""];if(/\$$/.test(n.pre))for(var o=0;o<i.length;o++){var a=s+"{"+n.body+"}"+i[o];r.push(a);}else {var h,c,l=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(n.body),p=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(n.body),u=l||p,E=n.body.indexOf(",")>=0;if(!u&&!E)return n.post.match(/,.*\}/)?G(e=n.pre+"{"+n.body+T+n.post):[e];if(u)h=n.body.split(/\.\./);else if(1===(h=D(n.body)).length&&1===(h=G(h[0],!1).map(j)).length)return i.map((function(e){return n.pre+h[0]+e}));if(u){var f=w(h[0]),d=w(h[1]),g=Math.max(h[0].length,h[1].length),I=3==h.length?Math.abs(w(h[2])):1,m=x;d<f&&(I*=-1,m=F);var R=h.some(M);c=[];for(var N=f;m(N,d);N+=I){var O;if(p)"\\"===(O=String.fromCharCode(N))&&(O="");else if(O=String(N),R){var b=g-O.length;if(b>0){var A=new Array(b+1).join("0");O=N<0?"-"+A+O.slice(1):A+O;}}c.push(O);}}else {c=[];for(var $=0;$<h.length;$++)c.push.apply(c,G(h[$],!1));}for($=0;$<c.length;$++)for(o=0;o<i.length;o++){a=s+c[$]+i[o];(!t||u||a)&&r.push(a);}}return r}const C=_=(e,t,r={})=>(W(t),!(!r.nocomment&&"#"===t.charAt(0))&&new K(t,r).match(e));var _=C;const U=m;C.sep=U.sep;const X=Symbol("globstar **");C.GLOBSTAR=X;const k=A,B={"!":{open:"(?:(?!(?:",close:"))[^/]*?)"},"?":{open:"(?:",close:")?"},"+":{open:"(?:",close:")+"},"*":{open:"(?:",close:")*"},"@":{open:"(?:",close:")"}},H=e=>e.split("").reduce(((e,t)=>(e[t]=!0,e)),{}),V=H("().*{}+?[]^$\\!"),z=H("[.("),Z=/\/+/;C.filter=(e,t={})=>(r,n,s)=>C(r,e,t);const Y=(e,t={})=>{const r={};return Object.keys(e).forEach((t=>r[t]=e[t])),Object.keys(t).forEach((e=>r[e]=t[e])),r};C.defaults=e=>{if(!e||"object"!=typeof e||!Object.keys(e).length)return C;const t=C,r=(r,n,s)=>t(r,n,Y(e,s));return (r.Minimatch=class extends t.Minimatch{constructor(t,r){super(t,Y(e,r));}}).defaults=r=>t.defaults(Y(e,r)).Minimatch,r.filter=(r,n)=>t.filter(r,Y(e,n)),r.defaults=r=>t.defaults(Y(e,r)),r.makeRe=(r,n)=>t.makeRe(r,Y(e,n)),r.braceExpand=(r,n)=>t.braceExpand(r,Y(e,n)),r.match=(r,n,s)=>t.match(r,n,Y(e,s)),r},C.braceExpand=(e,t)=>J(e,t);const J=(e,t={})=>(W(e),t.nobrace||!/\{(?:(?!\{).)*\}/.test(e)?[e]:k(e)),W=e=>{if("string"!=typeof e)throw new TypeError("invalid pattern");if(e.length>65536)throw new TypeError("pattern is too long")},q=Symbol("subparse");C.makeRe=(e,t)=>new K(e,t||{}).makeRe(),C.match=(e,t,r={})=>{const n=new K(t,r);return e=e.filter((e=>n.match(e))),n.options.nonull&&!e.length&&e.push(t),e};class K{constructor(e,t){W(e),t||(t={}),this.options=t,this.set=[],this.pattern=e,this.regexp=null,this.negate=!1,this.comment=!1,this.empty=!1,this.partial=!!t.partial,this.make();}debug(){}make(){const e=this.pattern,t=this.options;if(!t.nocomment&&"#"===e.charAt(0))return void(this.comment=!0);if(!e)return void(this.empty=!0);this.parseNegate();let r=this.globSet=this.braceExpand();t.debug&&(this.debug=(...e)=>console.error(...e)),this.debug(this.pattern,r),r=this.globParts=r.map((e=>e.split(Z))),this.debug(this.pattern,r),r=r.map(((e,t,r)=>e.map(this.parse,this))),this.debug(this.pattern,r),r=r.filter((e=>-1===e.indexOf(!1))),this.debug(this.pattern,r),this.set=r;}parseNegate(){if(this.options.nonegate)return;const e=this.pattern;let t=!1,r=0;for(let n=0;n<e.length&&"!"===e.charAt(n);n++)t=!t,r++;r&&(this.pattern=e.substr(r)),this.negate=t;}matchOne(e,t,r){var n=this.options;this.debug("matchOne",{this:this,file:e,pattern:t}),this.debug("matchOne",e.length,t.length);for(var s=0,i=0,o=e.length,a=t.length;s<o&&i<a;s++,i++){this.debug("matchOne loop");var h,c=t[i],l=e[s];if(this.debug(t,c,l),!1===c)return !1;if(c===X){this.debug("GLOBSTAR",[t,c,l]);var p=s,u=i+1;if(u===a){for(this.debug("** at the end");s<o;s++)if("."===e[s]||".."===e[s]||!n.dot&&"."===e[s].charAt(0))return !1;return !0}for(;p<o;){var E=e[p];if(this.debug("\nglobstar while",e,p,t,u,E),this.matchOne(e.slice(p),t.slice(u),r))return this.debug("globstar found match!",p,o,E),!0;if("."===E||".."===E||!n.dot&&"."===E.charAt(0)){this.debug("dot detected!",e,p,t,u);break}this.debug("globstar swallow a segment, and continue"),p++;}return !(!r||(this.debug("\n>>> no match, partial?",e,p,t,u),p!==o))}if("string"==typeof c?(h=l===c,this.debug("string match",c,l,h)):(h=l.match(c),this.debug("pattern match",c,l,h)),!h)return !1}if(s===o&&i===a)return !0;if(s===o)return r;if(i===a)return s===o-1&&""===e[s];throw new Error("wtf?")}braceExpand(){return J(this.pattern,this.options)}parse(e,t){W(e);const r=this.options;if("**"===e){if(!r.noglobstar)return X;e="*";}if(""===e)return "";let n="",s=!!r.nocase,i=!1;const o=[],a=[];let h,c,l,p,u=!1,E=-1,f=-1;const d="."===e.charAt(0)?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)",g=()=>{if(h){switch(h){case"*":n+="[^/]*?",s=!0;break;case"?":n+="[^/]",s=!0;break;default:n+="\\"+h;}this.debug("clearStateChar %j %j",h,n),h=!1;}};for(let t,d=0;d<e.length&&(t=e.charAt(d));d++)if(this.debug("%s\t%s %s %j",e,d,n,t),i){if("/"===t)return !1;V[t]&&(n+="\\"),n+=t,i=!1;}else switch(t){case"/":return !1;case"\\":g(),i=!0;continue;case"?":case"*":case"+":case"@":case"!":if(this.debug("%s\t%s %s %j <-- stateChar",e,d,n,t),u){this.debug("  in class"),"!"===t&&d===f+1&&(t="^"),n+=t;continue}this.debug("call clearStateChar %j",h),g(),h=t,r.noext&&g();continue;case"(":if(u){n+="(";continue}if(!h){n+="\\(";continue}o.push({type:h,start:d-1,reStart:n.length,open:B[h].open,close:B[h].close}),n+="!"===h?"(?:(?!(?:":"(?:",this.debug("plType %j %j",h,n),h=!1;continue;case")":if(u||!o.length){n+="\\)";continue}g(),s=!0,l=o.pop(),n+=l.close,"!"===l.type&&a.push(l),l.reEnd=n.length;continue;case"|":if(u||!o.length){n+="\\|";continue}g(),n+="|";continue;case"[":if(g(),u){n+="\\"+t;continue}u=!0,f=d,E=n.length,n+=t;continue;case"]":if(d===f+1||!u){n+="\\"+t;continue}c=e.substring(f+1,d);try{RegExp("["+c+"]");}catch(e){p=this.parse(c,q),n=n.substr(0,E)+"\\["+p[0]+"\\]",s=s||p[1],u=!1;continue}s=!0,u=!1,n+=t;continue;default:g(),!V[t]||"^"===t&&u||(n+="\\"),n+=t;}for(u&&(c=e.substr(f+1),p=this.parse(c,q),n=n.substr(0,E)+"\\["+p[0],s=s||p[1]),l=o.pop();l;l=o.pop()){let e;e=n.slice(l.reStart+l.open.length),this.debug("setting tail",n,l),e=e.replace(/((?:\\{2}){0,64})(\\?)\|/g,((e,t,r)=>(r||(r="\\"),t+t+r+"|"))),this.debug("tail=%j\n   %s",e,e,l,n);const t="*"===l.type?"[^/]*?":"?"===l.type?"[^/]":"\\"+l.type;s=!0,n=n.slice(0,l.reStart)+t+"\\("+e;}g(),i&&(n+="\\\\");const I=z[n.charAt(0)];for(let e=a.length-1;e>-1;e--){const r=a[e],s=n.slice(0,r.reStart),i=n.slice(r.reStart,r.reEnd-8);let o=n.slice(r.reEnd);const h=n.slice(r.reEnd-8,r.reEnd)+o,c=s.split("(").length-1;let l=o;for(let e=0;e<c;e++)l=l.replace(/\)[+*?]?/,"");o=l;n=s+i+o+(""===o&&t!==q?"$":"")+h;}if(""!==n&&s&&(n="(?=.)"+n),I&&(n=d+n),t===q)return [n,s];if(!s)return e.replace(/\\(.)/g,"$1");const m=r.nocase?"i":"";try{return Object.assign(new RegExp("^"+n+"$",m),{_glob:e,_src:n})}catch(e){return new RegExp("$.")}}makeRe(){if(this.regexp||!1===this.regexp)return this.regexp;const e=this.set;if(!e.length)return this.regexp=!1,this.regexp;const t=this.options,r=t.noglobstar?"[^/]*?":t.dot?"(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?":"(?:(?!(?:\\/|^)\\.).)*?",n=t.nocase?"i":"";let s=e.map((e=>(e=e.map((e=>"string"==typeof e?e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):e===X?X:e._src)).reduce(((e,t)=>(e[e.length-1]===X&&t===X||e.push(t),e)),[]),e.forEach(((t,n)=>{t===X&&e[n-1]!==X&&(0===n?e.length>1?e[n+1]="(?:\\/|"+r+"\\/)?"+e[n+1]:e[n]=r:n===e.length-1?e[n-1]+="(?:\\/|"+r+")?":(e[n-1]+="(?:\\/|\\/"+r+"\\/)"+e[n+1],e[n+1]=X));})),e.filter((e=>e!==X)).join("/")))).join("|");s="^(?:"+s+")$",this.negate&&(s="^(?!"+s+").*$");try{this.regexp=new RegExp(s,n);}catch(e){this.regexp=!1;}return this.regexp}match(e,t=this.partial){if(this.debug("match",e,this.pattern),this.comment)return !1;if(this.empty)return ""===e;if("/"===e&&t)return !0;const r=this.options;"/"!==U.sep&&(e=e.split(U.sep).join("/")),e=e.split(Z),this.debug(this.pattern,"split",e);const n=this.set;let s;this.debug(this.pattern,"set",n);for(let t=e.length-1;t>=0&&(s=e[t],!s);t--);for(let i=0;i<n.length;i++){const o=n[i];let a=e;r.matchBase&&1===o.length&&(a=[s]);if(this.matchOne(a,o,t))return !!r.flipNegate||!this.negate}return !r.flipNegate&&this.negate}static defaults(e){return C.defaults(e).Minimatch}}C.Minimatch=K;var Q,ee=function(){},te=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function r(){this.constructor=e;}d(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r);}(t,e),t}(ee),ne=function(){this.added=[],this.changed=[];},se=function(){this.status="init",this.message="";};!function(e){e[e.HaveNothingUpdate=0]="HaveNothingUpdate",e[e.Success=1]="Success",e[e.Failed=2]="Failed";}(Q||(Q={}));var ie="object"==typeof process&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};var oe={SEMVER_SPEC_VERSION:"2.0.0",MAX_LENGTH:256,MAX_SAFE_INTEGER:Number.MAX_SAFE_INTEGER||9007199254740991,MAX_SAFE_COMPONENT_LENGTH:16},ae={exports:{}};!function(e,t){const{MAX_SAFE_COMPONENT_LENGTH:r}=oe,n=ie,s=(t=e.exports={}).re=[],i=t.src=[],o=t.t={};let a=0;const h=(e,t,r)=>{const h=a++;n(e,h,t),o[e]=h,i[h]=t,s[h]=new RegExp(t,r?"g":void 0);};h("NUMERICIDENTIFIER","0|[1-9]\\d*"),h("NUMERICIDENTIFIERLOOSE","[0-9]+"),h("NONNUMERICIDENTIFIER","\\d*[a-zA-Z-][a-zA-Z0-9-]*"),h("MAINVERSION",`(${i[o.NUMERICIDENTIFIER]})\\.(${i[o.NUMERICIDENTIFIER]})\\.(${i[o.NUMERICIDENTIFIER]})`),h("MAINVERSIONLOOSE",`(${i[o.NUMERICIDENTIFIERLOOSE]})\\.(${i[o.NUMERICIDENTIFIERLOOSE]})\\.(${i[o.NUMERICIDENTIFIERLOOSE]})`),h("PRERELEASEIDENTIFIER",`(?:${i[o.NUMERICIDENTIFIER]}|${i[o.NONNUMERICIDENTIFIER]})`),h("PRERELEASEIDENTIFIERLOOSE",`(?:${i[o.NUMERICIDENTIFIERLOOSE]}|${i[o.NONNUMERICIDENTIFIER]})`),h("PRERELEASE",`(?:-(${i[o.PRERELEASEIDENTIFIER]}(?:\\.${i[o.PRERELEASEIDENTIFIER]})*))`),h("PRERELEASELOOSE",`(?:-?(${i[o.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${i[o.PRERELEASEIDENTIFIERLOOSE]})*))`),h("BUILDIDENTIFIER","[0-9A-Za-z-]+"),h("BUILD",`(?:\\+(${i[o.BUILDIDENTIFIER]}(?:\\.${i[o.BUILDIDENTIFIER]})*))`),h("FULLPLAIN",`v?${i[o.MAINVERSION]}${i[o.PRERELEASE]}?${i[o.BUILD]}?`),h("FULL",`^${i[o.FULLPLAIN]}$`),h("LOOSEPLAIN",`[v=\\s]*${i[o.MAINVERSIONLOOSE]}${i[o.PRERELEASELOOSE]}?${i[o.BUILD]}?`),h("LOOSE",`^${i[o.LOOSEPLAIN]}$`),h("GTLT","((?:<|>)?=?)"),h("XRANGEIDENTIFIERLOOSE",`${i[o.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),h("XRANGEIDENTIFIER",`${i[o.NUMERICIDENTIFIER]}|x|X|\\*`),h("XRANGEPLAIN",`[v=\\s]*(${i[o.XRANGEIDENTIFIER]})(?:\\.(${i[o.XRANGEIDENTIFIER]})(?:\\.(${i[o.XRANGEIDENTIFIER]})(?:${i[o.PRERELEASE]})?${i[o.BUILD]}?)?)?`),h("XRANGEPLAINLOOSE",`[v=\\s]*(${i[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[o.XRANGEIDENTIFIERLOOSE]})(?:${i[o.PRERELEASELOOSE]})?${i[o.BUILD]}?)?)?`),h("XRANGE",`^${i[o.GTLT]}\\s*${i[o.XRANGEPLAIN]}$`),h("XRANGELOOSE",`^${i[o.GTLT]}\\s*${i[o.XRANGEPLAINLOOSE]}$`),h("COERCE",`(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?(?:$|[^\\d])`),h("COERCERTL",i[o.COERCE],!0),h("LONETILDE","(?:~>?)"),h("TILDETRIM",`(\\s*)${i[o.LONETILDE]}\\s+`,!0),t.tildeTrimReplace="$1~",h("TILDE",`^${i[o.LONETILDE]}${i[o.XRANGEPLAIN]}$`),h("TILDELOOSE",`^${i[o.LONETILDE]}${i[o.XRANGEPLAINLOOSE]}$`),h("LONECARET","(?:\\^)"),h("CARETTRIM",`(\\s*)${i[o.LONECARET]}\\s+`,!0),t.caretTrimReplace="$1^",h("CARET",`^${i[o.LONECARET]}${i[o.XRANGEPLAIN]}$`),h("CARETLOOSE",`^${i[o.LONECARET]}${i[o.XRANGEPLAINLOOSE]}$`),h("COMPARATORLOOSE",`^${i[o.GTLT]}\\s*(${i[o.LOOSEPLAIN]})$|^$`),h("COMPARATOR",`^${i[o.GTLT]}\\s*(${i[o.FULLPLAIN]})$|^$`),h("COMPARATORTRIM",`(\\s*)${i[o.GTLT]}\\s*(${i[o.LOOSEPLAIN]}|${i[o.XRANGEPLAIN]})`,!0),t.comparatorTrimReplace="$1$2$3",h("HYPHENRANGE",`^\\s*(${i[o.XRANGEPLAIN]})\\s+-\\s+(${i[o.XRANGEPLAIN]})\\s*$`),h("HYPHENRANGELOOSE",`^\\s*(${i[o.XRANGEPLAINLOOSE]})\\s+-\\s+(${i[o.XRANGEPLAINLOOSE]})\\s*$`),h("STAR","(<|>)?=?\\s*\\*"),h("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),h("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$");}(ae,ae.exports);const he=["includePrerelease","loose","rtl"];var ce=e=>e?"object"!=typeof e?{loose:!0}:he.filter((t=>e[t])).reduce(((e,t)=>(e[t]=!0,e)),{}):{};const le=/^[0-9]+$/,pe=(e,t)=>{const r=le.test(e),n=le.test(t);return r&&n&&(e=+e,t=+t),e===t?0:r&&!n?-1:n&&!r?1:e<t?-1:1};var ue={compareIdentifiers:pe,rcompareIdentifiers:(e,t)=>pe(t,e)};const Ee=ie,{MAX_LENGTH:fe,MAX_SAFE_INTEGER:de}=oe,{re:ge,t:Ie}=ae.exports,me=ce,{compareIdentifiers:Re}=ue;class Ne{constructor(e,t){if(t=me(t),e instanceof Ne){if(e.loose===!!t.loose&&e.includePrerelease===!!t.includePrerelease)return e;e=e.version;}else if("string"!=typeof e)throw new TypeError(`Invalid Version: ${e}`);if(e.length>fe)throw new TypeError(`version is longer than ${fe} characters`);Ee("SemVer",e,t),this.options=t,this.loose=!!t.loose,this.includePrerelease=!!t.includePrerelease;const r=e.trim().match(t.loose?ge[Ie.LOOSE]:ge[Ie.FULL]);if(!r)throw new TypeError(`Invalid Version: ${e}`);if(this.raw=e,this.major=+r[1],this.minor=+r[2],this.patch=+r[3],this.major>de||this.major<0)throw new TypeError("Invalid major version");if(this.minor>de||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>de||this.patch<0)throw new TypeError("Invalid patch version");r[4]?this.prerelease=r[4].split(".").map((e=>{if(/^[0-9]+$/.test(e)){const t=+e;if(t>=0&&t<de)return t}return e})):this.prerelease=[],this.build=r[5]?r[5].split("."):[],this.format();}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(e){if(Ee("SemVer.compare",this.version,this.options,e),!(e instanceof Ne)){if("string"==typeof e&&e===this.version)return 0;e=new Ne(e,this.options);}return e.version===this.version?0:this.compareMain(e)||this.comparePre(e)}compareMain(e){return e instanceof Ne||(e=new Ne(e,this.options)),Re(this.major,e.major)||Re(this.minor,e.minor)||Re(this.patch,e.patch)}comparePre(e){if(e instanceof Ne||(e=new Ne(e,this.options)),this.prerelease.length&&!e.prerelease.length)return -1;if(!this.prerelease.length&&e.prerelease.length)return 1;if(!this.prerelease.length&&!e.prerelease.length)return 0;let t=0;do{const r=this.prerelease[t],n=e.prerelease[t];if(Ee("prerelease compare",t,r,n),void 0===r&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===r)return -1;if(r!==n)return Re(r,n)}while(++t)}compareBuild(e){e instanceof Ne||(e=new Ne(e,this.options));let t=0;do{const r=this.build[t],n=e.build[t];if(Ee("prerelease compare",t,r,n),void 0===r&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===r)return -1;if(r!==n)return Re(r,n)}while(++t)}inc(e,t){switch(e){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",t);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",t);break;case"prepatch":this.prerelease.length=0,this.inc("patch",t),this.inc("pre",t);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",t),this.inc("pre",t);break;case"major":0===this.minor&&0===this.patch&&0!==this.prerelease.length||this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":0===this.patch&&0!==this.prerelease.length||this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":if(0===this.prerelease.length)this.prerelease=[0];else {let e=this.prerelease.length;for(;--e>=0;)"number"==typeof this.prerelease[e]&&(this.prerelease[e]++,e=-2);-1===e&&this.prerelease.push(0);}t&&(this.prerelease[0]===t?isNaN(this.prerelease[1])&&(this.prerelease=[t,0]):this.prerelease=[t,0]);break;default:throw new Error(`invalid increment argument: ${e}`)}return this.format(),this.raw=this.version,this}}const Oe=Ne;const be=(e,t,r)=>new Oe(e,r).compare(new Oe(t,r));var Le=(e,t,r)=>be(e,t,r)>0;function Ae(t){return crypto.createHash("sha256").update(t).digest("hex")}function $e(e,t){return "function"==typeof e?e(t):!(!e||!Array.isArray(e)||0===e.length)&&new RegExp(e.reduce((function(e,t){return e+"|"+_.makeRe(t).source}),"").substring(1)).test(t)}function ve(e,n){var a,h;void 0===n&&(n={});var c,l=require$$0$1.statSync(e),p=require$$1.basename(e);return l.isFile()?$e(null===(a=null==n?void 0:n.files)||void 0===a?void 0:a.exclude,p)?null:((c=new ee).name=p,c.hash=Ae(require$$0$1.readFileSync(e)),c):l.isDirectory()?$e(null===(h=null==n?void 0:n.folders)||void 0===h?void 0:h.exclude,p)?null:((c=new te).name=p,c.children=require$$0$1.readdirSync(e).map((function(t){return ve(require$$1.join(e,t),n)})).filter((function(e){return null!==e})),c.hash=Ae(c.children.map((function(e){return e.hash})).join("")),c):null}function Te(e){e&&e.children&&(e.childrenObject=e.children.reduce((function(e,t){return t.children&&Te(t),e[t.name]=t,e}),{}));}function Se(e,t,r,n){return void 0===r&&(r=new ne),void 0===n&&(n="."),t.hash===e.hash||(t.children?t.children.forEach((function(t){t=t,e.childrenObject&&e.childrenObject[t.name]?Se(e.childrenObject[t.name],t,r,n+"/"+t.name):ye(t,n+"/"+t.name,r.added);})):r.changed.push({filePath:n,hash:t.hash})),r}function ye(e,t,r){e.children?e.children.forEach((function(e){ye(e,t+"/"+e.name,r);})):r.push({filePath:t,hash:e.hash});}function De(e,t,s,i,o,a,h,u,E,d){return void 0===d&&(d={files:{}}),g(this,void 0,void 0,(function(){var g,m,R,N,O,b;return I(this,(function(I){switch(I.label){case 0:g=require$$1.dirname(i),m=new se,require$$0$1.existsSync(o)||require$$0$1.mkdirSync(o),R=process.noAsar,I.label=1;case 1:return I.trys.push([1,6,,7]),Le(h.version,s)?(m.status="downloading",process.noAsar=!0,Te(N=ve(g,d)),O=Se(N,h.hash),require$$0$1.writeFileSync(require$$1.join(o,a+".json"),JSON.stringify(O,null,2)),console.log(O),e(m),u.endsWith("/")||(u+="/"),[4,Promise.all(O.changed.map((function(e){return je(e.hash,"".concat(u,"/").concat(e.hash,".gz"),require$$1.join(o,e.hash),E)})))]):[3,4];case 2:return I.sent(),[4,Promise.all(O.added.map((function(e){return je(e.hash,"".concat(u,"/").concat(e.hash,".gz"),require$$1.join(o,e.hash),E)})))];case 3:return I.sent(),process.noAsar=R,console.log("complete"),m.status="finished",e(m),child_process.spawn(t,{detached:!0,env:{exe_path:i,update_temp_path:o,update_config_file_name:a+".json",exe_pid:process.pid.toString()},stdio:"ignore"}),[2,Q.Success];case 4:return [2,Q.HaveNothingUpdate];case 5:return [3,7];case 6:return b=I.sent(),process.noAsar=R,console.log(b),m.status="failed",m.message=b,e(m),[2,Q.Failed];case 7:return [2]}}))}))}function je(t,r,n,s){return new Promise((function(o,h){if(require$$0$1.existsSync(n)&&Ae(require$$0$1.readFileSync(n))===t)o(!0);else {var l=crypto.createHash("sha256"),p=require$$1$1.createGunzip(),u=require$$0$1.createWriteStream(n);s(r).then((function(e){e.pipe(p);}),(function(e){h(e);})),p.on("error",(function(e){p.close(),u.close(),l.destroy(),h(e);})),p.on("data",(function(e){l.write(e),u.write(e);})),p.on("end",(function(){l.digest("hex")!==t?(l.destroy(),h(new Error("下载文件出错"))):o(!0);}));}}))}

var output = "./build";
var target = "gzip";
var input = "./build/win-unpacked";
var updateJsonName = "update-config";
var version = "1.0.0";
var tempDirectory = "update_temp";
var oldDirectory = "old_temp";
var url = "http://localhost:5000";
var updaterName = "updater";
var updateConfig = {
	output: output,
	target: target,
	input: input,
	updateJsonName: updateJsonName,
	version: version,
	tempDirectory: tempDirectory,
	oldDirectory: oldDirectory,
	url: url,
	updaterName: updaterName
};

const request = axios__default["default"].create();
async function updater(windows) {
  const statusCallback = (status) => {
    if (windows)
      windows.webContents.send("hot-update-status", status);
  };
  const downloadFn = async (url) => {
    const response = await request({
      method: "get",
      url,
      responseType: "stream"
    });
    return response.data;
  };
  const dirDirectory = require$$1.join(electron.app.getAppPath(), "..", "..");
  const tempDirectory = require$$1.join(dirDirectory, updateConfig.tempDirectory);
  try {
    const res = await request({ url: `${updateConfig.url}/${updateConfig.updateJsonName}.json?time=${new Date().getTime()}` });
    const updateJson = res.data;
    return await De(statusCallback, updateConfig.updaterName || "updater", version$1, electron.app.getPath("exe"), tempDirectory, updateConfig.updateJsonName, updateJson, `${updateConfig.url}/${updateConfig.target + updateJson.version}`, downloadFn);
  } catch (error) {
    console.log(error);
    const updateInfo = new se();
    updateInfo.status = "failed";
    updateInfo.message = error;
    if (windows)
      windows.webContents.send("hot-update-status", updateInfo);
  }
}

class Main {
  constructor(mainWindow, downloadUrl) {
    this.mainWindow = null;
    this.downloadUrl = "";
    this.version = packageInfo.version;
    this.baseUrl = "";
    this.Sysarch = os.arch().includes("64") ? "win64" : "win32";
    this.HistoryFilePath = require$$1.join(electron.app.getPath("downloads"), os.platform().includes("win32") ? `electron_${this.version}_${this.Sysarch}.exe` : `electron_${this.version}_mac.dmg`);
    this.mainWindow = mainWindow;
    this.downloadUrl = downloadUrl || os.platform().includes("win32") ? this.baseUrl + `electron_${this.version}_${this.Sysarch}.exe?${new Date().getTime()}` : this.baseUrl + `electron_${this.version}_mac.dmg?${new Date().getTime()}`;
  }
  start() {
    lib.stat(this.HistoryFilePath, async (err, stats) => {
      try {
        if (stats) {
          await lib.remove(this.HistoryFilePath);
        }
        this.mainWindow.webContents.downloadURL(this.downloadUrl);
      } catch (error) {
        console.log(error);
      }
    });
    this.mainWindow.webContents.session.on("will-download", (event, item, webContents) => {
      const filePath = require$$1.join(electron.app.getPath("downloads"), item.getFilename());
      item.setSavePath(filePath);
      item.on("updated", (event2, state) => {
        switch (state) {
          case "progressing":
            this.mainWindow.webContents.send("download-progress", (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0));
            break;
          default:
            this.mainWindow.webContents.send("download-error", true);
            electron.dialog.showErrorBox("\u4E0B\u8F7D\u51FA\u9519", "\u7531\u4E8E\u7F51\u7EDC\u6216\u5176\u4ED6\u672A\u77E5\u539F\u56E0\u5BFC\u81F4\u4E0B\u8F7D\u51FA\u9519");
            break;
        }
      });
      item.once("done", (event2, state) => {
        switch (state) {
          case "completed":
            const data = {
              filePath
            };
            this.mainWindow.webContents.send("download-done", data);
            break;
          case "interrupted":
            this.mainWindow.webContents.send("download-error", true);
            electron.dialog.showErrorBox("\u4E0B\u8F7D\u51FA\u9519", "\u7531\u4E8E\u7F51\u7EDC\u6216\u5176\u4ED6\u672A\u77E5\u539F\u56E0\u5BFC\u81F4\u4E0B\u8F7D\u51FA\u9519.");
            break;
        }
      });
    });
  }
}

class Update {
  constructor() {
    electronUpdater.autoUpdater.setFeedURL("http://127.0.0.1:25565/");
    electronUpdater.autoUpdater.on("error", (err) => {
      console.log("\u66F4\u65B0\u51FA\u73B0\u9519\u8BEF", err.message);
      if (err.message.includes("sha512 checksum mismatch")) {
        this.Message(this.mainWindow, -1, "sha512\u6821\u9A8C\u5931\u8D25");
      } else {
        this.Message(this.mainWindow, -1, "\u9519\u8BEF\u4FE1\u606F\u8BF7\u770B\u4E3B\u8FDB\u7A0B\u63A7\u5236\u53F0");
      }
    });
    electronUpdater.autoUpdater.on("checking-for-update", (event, arg) => {
      console.log("\u5F00\u59CB\u68C0\u67E5\u66F4\u65B0");
      this.Message(this.mainWindow, 0);
    });
    electronUpdater.autoUpdater.on("update-available", (event, arg) => {
      console.log("\u6709\u66F4\u65B0");
      this.Message(this.mainWindow, 1);
    });
    electronUpdater.autoUpdater.on("update-not-available", (event, arg) => {
      console.log("\u6CA1\u6709\u66F4\u65B0");
      this.Message(this.mainWindow, 2);
    });
    electronUpdater.autoUpdater.on("download-progress", (progressObj) => {
      this.Message(this.mainWindow, 3, progressObj);
    });
    electronUpdater.autoUpdater.on("update-downloaded", () => {
      console.log("\u4E0B\u8F7D\u5B8C\u6210");
      this.Message(this.mainWindow, 4);
    });
  }
  Message(mainWindow, type, data) {
    const senddata = {
      state: type,
      msg: data || ""
    };
    mainWindow.webContents.send("UpdateMsg", senddata);
  }
  checkUpdate(mainWindow) {
    this.mainWindow = mainWindow;
    electronUpdater.autoUpdater.checkForUpdates().catch((err) => {
      console.log("\u7F51\u7EDC\u8FDE\u63A5\u95EE\u9898", err);
    });
  }
  quitAndInstall() {
    electronUpdater.autoUpdater.quitAndInstall();
  }
}

const mainWindowConfig = {
  height: 800,
  useContentSize: true,
  width: 1700,
  minWidth: 1366,
  show: false,
  frame: config.IsUseSysTitle,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    webSecurity: false,
    devTools: false,
    scrollBounce: process.platform === "darwin"
  }
};
const otherWindowConfig = {
  height: 595,
  useContentSize: true,
  width: 1140,
  autoHideMenuBar: true,
  minWidth: 842,
  frame: config.IsUseSysTitle,
  show: false,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    webSecurity: false,
    devTools: false,
    scrollBounce: process.platform === "darwin"
  }
};

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
function usePrintHandle() {
  electron.ipcMain.handle("getPrinters", async (event) => {
    return await event.sender.getPrintersAsync();
  });
  electron.ipcMain.handle("printHandlePrint", async (event, options) => {
    return new Promise((resolve) => {
      event.sender.print(options, (success, failureReason) => {
        resolve({ success, failureReason });
      });
    });
  });
  electron.ipcMain.handle("openPrintDemoWindow", () => {
    openPrintDemoWindow();
  });
}
let win;
function openPrintDemoWindow() {
  if (win) {
    win.show();
    return;
  }
  win = new electron.BrowserWindow(__spreadValues$2({
    titleBarStyle: "hidden"
  }, Object.assign(otherWindowConfig, {})));
  win.loadURL(printURL);
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    win = null;
  });
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var setIpc = {
  Mainfunc() {
    usePrintHandle();
    const allUpdater = new Update();
    electron.ipcMain.handle("IsUseSysTitle", async () => {
      return config.IsUseSysTitle;
    });
    electron.ipcMain.handle("windows-mini", (event, args) => {
      var _a;
      (_a = electron.BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _a.minimize();
    });
    electron.ipcMain.handle("window-max", async (event, args) => {
      var _a, _b, _c;
      if ((_a = electron.BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _a.isMaximized()) {
        (_b = electron.BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _b.restore();
        return { status: false };
      } else {
        (_c = electron.BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _c.maximize();
        return { status: true };
      }
    });
    electron.ipcMain.handle("window-close", (event, args) => {
      var _a;
      (_a = electron.BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _a.close();
    });
    electron.ipcMain.handle("check-update", (event) => {
      allUpdater.checkUpdate(electron.BrowserWindow.fromWebContents(event.sender));
    });
    electron.ipcMain.handle("confirm-update", () => {
      allUpdater.quitAndInstall();
    });
    electron.ipcMain.handle("app-close", (event, args) => {
      electron.app.quit();
    });
    electron.ipcMain.handle("get-static-path", (event, args) => {
      return staticPaths;
    });
    electron.ipcMain.handle("open-messagebox", async (event, arg) => {
      const res = await electron.dialog.showMessageBox(electron.BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || "info",
        title: arg.title || "",
        buttons: arg.buttons || [],
        message: arg.message || "",
        noLink: arg.noLink || true
      });
      return res;
    });
    electron.ipcMain.handle("open-errorbox", (event, arg) => {
      electron.dialog.showErrorBox(
        arg.title,
        arg.message
      );
    });
    electron.ipcMain.handle("start-server", async () => {
      try {
        const serveStatus = await Server.StatrServer();
        console.log(serveStatus);
        return serveStatus;
      } catch (error) {
        electron.dialog.showErrorBox(
          "\u9519\u8BEF",
          error
        );
      }
    });
    electron.ipcMain.handle("stop-server", async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer();
        return serveStatus;
      } catch (error) {
        electron.dialog.showErrorBox(
          "\u9519\u8BEF",
          error
        );
      }
    });
    electron.ipcMain.handle("hot-update", (event, arg) => {
      updater$1(electron.BrowserWindow.fromWebContents(event.sender));
    });
    electron.ipcMain.handle("hot-update-test", async (event, arg) => {
      console.log("hot-update-test");
      try {
        let updateInfo = await updater(electron.BrowserWindow.fromWebContents(event.sender));
        if (updateInfo === Q.Success) {
          electron.app.quit();
        } else if (updateInfo === Q.HaveNothingUpdate) {
          console.log("\u4E0D\u9700\u8981\u66F4\u65B0");
        } else if (updateInfo === Q.Failed) {
          console.error("\u66F4\u65B0\u51FA\u9519");
        }
      } catch (error) {
        console.error("\u66F4\u65B0\u51FA\u9519");
      }
    });
    electron.ipcMain.handle("start-download", (event, msg) => {
      new Main(electron.BrowserWindow.fromWebContents(event.sender), msg.downloadUrl).start();
    });
    electron.ipcMain.handle("open-win", (event, arg) => {
      const ChildWin = new electron.BrowserWindow(__spreadValues$1({
        titleBarStyle: "hidden"
      }, Object.assign(otherWindowConfig, {})));
      ChildWin.loadURL(winURL + `#${arg.url}`);
      ChildWin.once("ready-to-show", () => {
        ChildWin.show();
        if (arg.IsPay) {
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL();
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close();
            }
          }, 1200);
          ChildWin.on("close", () => {
            clearInterval(testUrl);
          });
        }
      });
      ChildWin.once("show", () => {
        ChildWin.webContents.send("send-data-test", arg.sendData);
      });
    });
  }
};

const menu = [
  {
    label: "\u8BBE\u7F6E",
    submenu: [{
      label: "\u5FEB\u901F\u91CD\u542F",
      accelerator: "F5",
      role: "reload"
    }, {
      label: "\u9000\u51FA",
      accelerator: "CmdOrCtrl+F4",
      role: "close"
    }]
  },
  {
    label: "\u5E2E\u52A9",
    submenu: [{
      label: "\u5173\u4E8E",
      click: function() {
        info();
      }
    }]
  }
];
function info() {
  electron.dialog.showMessageBox({
    title: "\u5173\u4E8E",
    type: "info",
    message: "electron-Vue\u6846\u67B6",
    detail: `\u7248\u672C\u4FE1\u606F\uFF1A${packageInfo.version}
\u5F15\u64CE\u7248\u672C\uFF1A${process.versions.v8}
\u5F53\u524D\u7CFB\u7EDF\uFF1A${os.type()} ${os.arch()} ${os.release()}`,
    noLink: true,
    buttons: ["\u67E5\u770Bgithub", "\u786E\u5B9A"]
  });
}

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
class MainInit {
  constructor() {
    this.winURL = "";
    this.shartURL = "";
    this.loadWindow = null;
    this.mainWindow = null;
    this.winURL = winURL;
    this.shartURL = loadingURL;
    setIpc.Mainfunc();
  }
  createMainWindow() {
    this.mainWindow = new electron.BrowserWindow(__spreadValues({
      titleBarStyle: "hidden"
    }, Object.assign(mainWindowConfig, {})));
    const menu$1 = electron.Menu.buildFromTemplate(menu);
    electron.Menu.setApplicationMenu(menu$1);
    this.mainWindow.loadURL(this.winURL);
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
      this.loadWindow.destroy();
    });
    electron.app.on("render-process-gone", (event, webContents, details) => {
      const message = {
        title: "",
        buttons: [],
        message: ""
      };
      switch (details.reason) {
        case "crashed":
          message.title = "\u8B66\u544A";
          message.buttons = ["\u786E\u5B9A", "\u9000\u51FA"];
          message.message = "\u56FE\u5F62\u5316\u8FDB\u7A0B\u5D29\u6E83\uFF0C\u662F\u5426\u8FDB\u884C\u8F6F\u91CD\u542F\u64CD\u4F5C\uFF1F";
          break;
        case "killed":
          message.title = "\u8B66\u544A";
          message.buttons = ["\u786E\u5B9A", "\u9000\u51FA"];
          message.message = "\u7531\u4E8E\u672A\u77E5\u539F\u56E0\u5BFC\u81F4\u56FE\u5F62\u5316\u8FDB\u7A0B\u88AB\u7EC8\u6B62\uFF0C\u662F\u5426\u8FDB\u884C\u8F6F\u91CD\u542F\u64CD\u4F5C\uFF1F";
          break;
        case "oom":
          message.title = "\u8B66\u544A";
          message.buttons = ["\u786E\u5B9A", "\u9000\u51FA"];
          message.message = "\u5185\u5B58\u4E0D\u8DB3\uFF0C\u662F\u5426\u8F6F\u91CD\u542F\u91CA\u653E\u5185\u5B58\uFF1F";
          break;
      }
      electron.dialog.showMessageBox(this.mainWindow, {
        type: "warning",
        title: message.title,
        buttons: message.buttons,
        message: message.message,
        noLink: true
      }).then((res) => {
        if (res.response === 0)
          this.mainWindow.reload();
        else
          this.mainWindow.close();
      });
    });
    this.mainWindow.on("unresponsive", () => {
      electron.dialog.showMessageBox(this.mainWindow, {
        type: "warning",
        title: "\u8B66\u544A",
        buttons: ["\u91CD\u8F7D", "\u9000\u51FA"],
        message: "\u56FE\u5F62\u5316\u8FDB\u7A0B\u5931\u53BB\u54CD\u5E94\uFF0C\u662F\u5426\u7B49\u5F85\u5176\u6062\u590D\uFF1F",
        noLink: true
      }).then((res) => {
        if (res.response === 0)
          this.mainWindow.reload();
        else
          this.mainWindow.close();
      });
    });
    electron.app.on("child-process-gone", (event, details) => {
      const message = {
        title: "",
        buttons: [],
        message: ""
      };
      switch (details.type) {
        case "GPU":
          switch (details.reason) {
            case "crashed":
              message.title = "\u8B66\u544A";
              message.buttons = ["\u786E\u5B9A", "\u9000\u51FA"];
              message.message = "\u786C\u4EF6\u52A0\u901F\u8FDB\u7A0B\u5DF2\u5D29\u6E83\uFF0C\u662F\u5426\u5173\u95ED\u786C\u4EF6\u52A0\u901F\u5E76\u91CD\u542F\uFF1F";
              break;
            case "killed":
              message.title = "\u8B66\u544A";
              message.buttons = ["\u786E\u5B9A", "\u9000\u51FA"];
              message.message = "\u786C\u4EF6\u52A0\u901F\u8FDB\u7A0B\u88AB\u610F\u5916\u7EC8\u6B62\uFF0C\u662F\u5426\u5173\u95ED\u786C\u4EF6\u52A0\u901F\u5E76\u91CD\u542F\uFF1F";
              break;
          }
          break;
      }
      electron.dialog.showMessageBox(this.mainWindow, {
        type: "warning",
        title: message.title,
        buttons: message.buttons,
        message: message.message,
        noLink: true
      }).then((res) => {
        if (res.response === 0) {
          if (details.type === "GPU")
            electron.app.disableHardwareAcceleration();
          this.mainWindow.reload();
        } else {
          this.mainWindow.close();
        }
      });
    });
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }
  loadingWindow(loadingURL2) {
    this.loadWindow = new electron.BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: { experimentalFeatures: true }
    });
    this.loadWindow.loadURL(loadingURL2);
    this.loadWindow.show();
    this.loadWindow.setAlwaysOnTop(true);
    setTimeout(() => {
      this.createMainWindow();
    }, 1500);
  }
  initWindow() {
    {
      return this.loadingWindow(this.shartURL);
    }
  }
}

var DisableButton = {
  Disablef12() {
    {
      electron.globalShortcut.register("f12", () => {
        console.log("\u7528\u6237\u8BD5\u56FE\u542F\u52A8\u63A7\u5236\u53F0");
      });
    }
  }
};

function onAppReady() {
  new MainInit().initWindow();
  DisableButton.Disablef12();
}
try {
  electron.app.whenReady().then(onAppReady);
  electron.app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
  electron.app.on("window-all-closed", () => {
    electron.app.quit();
  });
  electron.app.on("browser-window-created", () => {
    console.log("window-created");
  });
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      electron.app.removeAsDefaultProtocolClient("electron-vue-template");
      console.log("\u7531\u4E8E\u6846\u67B6\u7279\u6B8A\u6027\u5F00\u53D1\u73AF\u5883\u4E0B\u65E0\u6CD5\u4F7F\u7528");
    }
  } else {
    electron.app.setAsDefaultProtocolClient("electron-vue-template");
  }
} catch (error) {
  console.log(error);
}
//# sourceMappingURL=main.js.map
