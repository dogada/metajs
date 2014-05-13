// common extensions;



// common runtime functions;

// reader;

// lint;

// scope;

// compiler;


var metajs = require("./metajs_node"),
    program = require("commander"),
    path = require("path"),
    fs = require("fs"),
    util = require("util"),
    inspect = util.inspect;

var vm = require("vm"),
    readline = require("readline"),
    util = require("util");

var createContext = (function(filename) {
  var context = vm.createContext();
  if ((typeof(path) !== "undefined")) {
    module.filename = filename;
  } else {
    module.filename = "<repl>";
  }
  context.module = module;
  context.require = require;
  // put all metajs and global symbols in repl context ;
  [global, metajs].forEach((function(obj) {
    return Object.keys(obj).forEach((function(key) {
      (context)[key] = (obj)[key];
    }));
  }));
  return context;
});

var startRepl = (function() {
  var input = process.stdin,
    output = process.stdout,
    rl = readline.createInterface(input, output),
    buf = "",
    context = createContext();
  var prompt = (function() {
    rl.setPrompt((function() {
      if ((buf.length === 0)) {
        return "metajs> ";
      } else {
        return "> ";
      }
    })());
    return rl.prompt();
  });
  var processLine = (function(line) {
    (function() {
      try {
        buf = (buf + line);
        (rl.history)[0] = buf;
        var jsStr = metajs.translate(buf),
    res = vm.runInContext(jsStr, context, "metajs-tepl");
        if ((typeof(res) !== "undefined")) {
          output.write((util.inspect(res) + "\n"));
        }
        (context)["_"] = res;
        buf = "";
      } catch (e) {
        if (e.message.match(/Missed closing bracket/)) {
          buf = (buf + " ");
          return rl.history.shift();
        } else {
          (rl.history)[0] = buf;
          output.write((e.stack + "\n"));
          buf = "";
        }
      }
    })();
    return prompt();
  });
  rl.on("line", processLine);
  rl.on("close", (function() {
    output.write("Bye!\n");
    return process.exit(0);
  }));
  output.write((metajs.versionString() + " TEPL (Translate Eval Print Loop)\n"));
  return prompt();
});


program.usage("[options] [file.mjs ...]").version(metajs.versionString()).option("-x, --execute", "Execute a MetaJS file.").option("-e, --eval <code>", "Eval MetaJS code.").option("-l, --lint", "Check MetaJS code and output only errors/warning/suggestions.").option("--lint-log-level <n>", "Lint's log level: 0 - nothing, 1 - errors, 2 - warnings, 3 - info.", parseInt, 3).option("-o, --output <dir>", "Output directory for translated files.").option("-b, --bootstrap", "Enable bootstrap mode (required for compiling MetaJS compiler only).").parse(process.argv);

var evalJs = (function(js, filename) {
  return vm.runInContext(js, createContext(filename), filename);
});

var outputJs = (function(sourcePath, jsStr) {
  var bn = path.basename(sourcePath, ".mjs"),
    outPath = (path.join(program.output, bn) + ".js");
  return fs.writeFile(outPath, jsStr);
});

var processFile = (function(sourcePath) {
  metajs.resetState();
  // clear root scope and lint;
  var jsStr = metajs.translateFile(sourcePath);
  if (program.lint) {
    return metajs.logLintReport();
  } else if (program.execute) {
    return evalJs(jsStr, sourcePath);
  } else if (program.output) {
    return outputJs(sourcePath, jsStr);
  } else {
    return console.log(jsStr);
  }
});

var resolveFileName = (function(name) {
  if (name.match(/^\/.+/)) {
    return name;
  } else {
    return path.join(process.cwd(), name);
  }
});

var processFiles = (function(fnames) {
  return fnames.forEach((function(name) {
    return (function() {
      try {
        return processFile(resolveFileName(name) /*logos:1*/ );
      } catch (e) {
        console.log(e.stack);
        if ((e instanceof metajs.LintError)) {
          return metajs.logLintReport();
        } else {
          throw (new Error(e));
        }
      }
    })();
  }));
});

var evalMjs = (function(mjsStr) {
  return (function() {
    try {
      var jsStr = metajs.translate(mjsStr);
      return console.log(evalJs(jsStr));
    } catch (e) {
      if ((e instanceof metajs.LintError)) {
        return metajs.logLintReport();
      } else {
        throw (new Error(e));
      }
    }
  })();
});

metajs.bootstrapMode = program.bootstrap;
metajs.lintLogLevel = program.lintLogLevel;

if (program.eval) {
  evalMjs(program.eval);
} else if ((program.args.length === 0)) {
  startRepl();
} else {
  processFiles(program.args);
}

if (program.lint) {
  process.exit(metajs.lintExitCode());
}

