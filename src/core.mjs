(defn error (x)
  (throw x))

(set-in metajs
        'stack []
        'file "<unknown>"
        'dir undefined
        'file-role undefined
        'last-id 0
        '*assert-handler* metajs.throw-handler
        'error error
        'lint-log-level 3)


(include "./lint")
(include "./scope")
;;; global scope for common macros like def, defn, etc
(start-scope "global")

(include "./runtime")

(include "./reader")
(include "./expansion")
(include "./logos")
(include "./raw")
(include "./compiler")

(include "./test")
(include "./assert")

(include "./binding")
(include "./javascript")
(include "./fn")
(include "./macros")
(include "./misc")
(include "./debug")

;;; root scope for user functions and macros
;;; symbol with same name as in global scope will hide but not delete global definition
(start-scope "root")
