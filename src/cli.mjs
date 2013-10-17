(def
  metajs (require "./metajs_node")
  program (require "commander")
  path (require 'path)
  fs (require 'fs)
  util (require 'util)
  inspect  util.inspect)

(include "./repl")

(program
 .usage "[options] [file.mjs ...]"
 .version (metajs.version-string)
 .option "-x, --execute" "Execute a MetaJS file."
 .option "-e, --eval <code>" "Eval MetaJS code."
 .option "-l, --lint" "Check MetaJS code and output only errors/warning/suggestions."
 .option "--lint-log-level <n>" "Lint's log level: 0 - nothing, 1 - errors, 2 - warnings, 3 - info." parseInt 3
 .option "-o, --output <dir>" "Output directory for translated files."
 .option "-b, --bootstrap" "Enable bootstrap mode (required for compiling MetaJS compiler only)."
 .parse process.argv)

(defn eval-js (js filename:?)
  (vm.run-in-context js (create-context filename) filename))

(defn output-js (source-path js-str)
  (def bn (path.basename source-path ".mjs")
    out-path (str (path.join program.output bn) ".js"))
  (fs.write-file out-path js-str))

(defn process-file (source-path)
  (metajs.reset-state)                  ; clear root scope and lint
  (def js-str (metajs.translate-file source-path))
  (if program.lint (metajs.log-lint-report)
      program.execute (eval-js js-str source-path)
      program.output (output-js source-path js-str)
      (log js-str)))

(defn process-files (fnames)
  (each (fname) fnames
        (try
          (process-file (path.join (process.cwd) fname))
          (catch e
              (log e.stack)
              (if (instanceof? e metajs.LintError) (metajs.log-lint-report)
                  (throw e))))))

(defn eval-mjs (mjs-str)
  (try
    (def js-str (metajs.translate mjs-str))
    (log (eval-js js-str))
    (catch e
        (if (instanceof? e metajs.LintError) (metajs.log-lint-report)
            (throw e)))))

(set metajs.bootstrap-mode program.bootstrap
     metajs.lint-log-level program.lint-log-level)

(if program.eval (eval-mjs program.eval)
    (empty? program.args) (start-repl)
    (process-files program.args))

(if program.lint
  (process.exit (metajs.lint-exit-code)))
