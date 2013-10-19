(def
  vm (require 'vm)
  readline (require 'readline)
  util (require 'util))

(defn create-context (filename:?)
  (def context (vm.create-context))
  (if (defined? path) (set module.filename filename)
      (set module.filename "<repl>"))
  (set-in context
          'module  module
          'require require)
  ;; put all metajs and global symbols in repl context 
  (each (obj) [global metajs]
        (each-key key obj
                  (set-in context key (get obj key))))
  context)

(defn start-repl ()
  (def input process.stdin
    output process.stdout
    rl (readline.create-interface input output)
    buf ""
    context (create-context))

  (defn prompt ()
    (rl.set-prompt (if (empty? buf) "metajs> " "> "))
    (rl.prompt))

  (defn process-line (line)
    (try
      (set buf (str buf line))
      (set-in rl.history 0 buf)
      (def js-str (metajs.translate buf)
        res (vm.run-in-context js-str context "metajs-tepl"))
      (when (defined? res)
        (output.write (str (util.inspect res) "\n")))
      (set-in context "_" res)
      (set buf "")
      (catch e
          (if (e.message.match /Missed closing bracket/)
            (do
              (set buf (str buf " "))
              (rl.history.shift))
            (do
              (set-in rl.history 0 buf)
              (output.write (str e.stack "\n"))
              (set buf "")))))
    (prompt))

  (rl.on 'line process-line)
  (rl.on 'close (fn ()
                  (output.write "Bye!\n")
                  (process.exit 0)))
  (output.write (str (metajs.version-string) " TEPL (Translate Eval Print Loop)\n"))
  (prompt))
