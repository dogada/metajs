(def passes 0 fails 0)

(defn green (& args)
  (str "\033[32m" (join "" args) "\033[0m"))

(defn red (& args)
  (str "\033[31m" (join "" args) "\033[0m"))

(defn log-assert-context (evaluated message ctx full:false)
  (def summary (str "Assert failed: " message))
  (console.error summary)
  (console.error ctx.assertion "at" ctx.path)
  (when-it ctx.resolved-params
           (each (arg i) it
                 (when full
                   (console.log (nth ctx.quoted-params i) "-->"))
                 (console.log arg)))
  summary)

(defn metajs.throw-handler (evaluated message ctx)
  (when (not evaluated)
    (def summary (log-assert-context))
    (throw (str summary " " ctx.assertion " at " ctx.path))))

(defn log-current-stack ()
  (console.log ((get (new Error) 'stack) .replace /Error.*/ "")))

(defn metajs.test-handler (evaluated message ctx)
  (if evaluated
    (do (inc passes)
        (metajs.pr (green ".")))
    (do (inc fails)
        (metajs.pr (str (red "F") " #" (+ passes fails) "\n"))
        (log-assert-context))))

(defn metajs.print-testing-state ()
  (log (str "\nExecuted " (+ passes fails) " tests, "
            (green passes " passed") ", " (red fails " failed."))))
