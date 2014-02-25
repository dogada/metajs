;;; common runtime functions
(declare metajs *env*)
(declare list? concat cons conj join map bulk-map filter compact merge pluck reversed sort zip zip* length)
(declare exports)
(declare Token token? first-token token-value* get-token-entities get-meta
         literal? list-literal? list-name? escape-js gensym)
(declare get-scope find-macro compile-one js-literal js-symbol raw inspect)
(declare quote*)
(declare-fn
 set-scope-macro (name args fn)
 setScopeMacro (name args fn)
 transform-args (args)
 log (& args))

