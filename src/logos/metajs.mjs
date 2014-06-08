;;; common runtime functions
(declare metajs *env*)
(declare list? concat cons conj join map bulk-map filter compact merge pluck reversed sort zip zip* length hash-map)
(declare exports)
(declare Token token? first-token token-value* get-token-entities get-meta
         literal? list-literal? list-name? symbol? quoted? escape-js gensym)
(declare get-scope find-macro compile-one js-literal js-symbol raw inspect)
(declare quote*)

(declare has-meta?)
;;; reader
(declare read)
;;; lint
(declare syntax-error
         lint-unknown-hints lint-duplicated-hints lint-missed-required-arg
         lint-undeclared-rest lint-multi-resolve lint-undefined
         lint-report lint-error-count reset-lint reset-scope LintError)
;;; scope
(declare find-def find-entities find-symbols add-scope-symbol dump-scope-logos)

;;; compiler

(declare fragment? expr stmt cdata with-meta push-js)


(declare-fn
 set-scope-macro (name args fn)
 setScopeMacro (name args fn)
 transform-args (args)
 log (& args)
 include (file)
 use (file))

