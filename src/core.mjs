(defn error (x)
  (throw x))

(set-in metajs
        'stack []
        'file "<unknown>"
        'dir undefined
        'last-id 0
        '*assert-handler* metajs.throw-handler
        'error error)

(include "./scope")
;;; global scope for common macroses like def, defn, etc
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

;;; root scope for user functions and macroses
;;; symbol with same name as in global scope will hide but not delete global definition
(start-scope "root")







