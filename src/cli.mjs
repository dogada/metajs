(def
  metajs (require "./metajs_node")
  program (require "commander")
  path (require 'path)
  fs (require 'fs))

(include "./repl")

(program
 .usage "[options] [file.mjs ...]"
 .version (metajs.version-string)
 .option "-x, --execute" "Execute a MetaJS file."
 .option "-e, --eval <code>" "Eval MetaJS code."
 .option "-o, --output <dir>" "Output directory for translated files."
 .option "-b, --bootstrap" "Enable bootstrap mode (required for compiling MetaJS compiler only)."
 .parse process.argv)

(defn eval-js (js filename:?)
  (vm.run-in-context js (create-context filename) filename))

(defn output-js (source-path js-str)
  (def bn (path.basename source-path ".mjs")
    out-path (str (path.join program.output bn) ".js"))
  (fs.write-file out-path js-str))

(defn process-files (fnames)
  (each (fname) fnames
        (def source-path (path.join (process.cwd) fname)
          js-str (metajs.translate-file source-path))
        (if program.output (output-js source-path js-str)
            program.execute (eval-js js-str source-path)
            (log js-str))))

(set metajs.bootstrap-mode program.bootstrap)
(if program.eval (log (eval-js (metajs.translate program.eval)))
    (empty? program.args) (start-repl)
    (process-files program.args))
