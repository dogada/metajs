(assert-js "(. a \"b-1\" 'c-2)" "(a)[\"b-1\"].c2;")

(defmacro literal-test (param)
  (literal? param))

(assert-not (literal-test "my-log"))
(assert (literal-test true))
(assert (literal-test false))
(assert (literal-test null))
(assert (literal-test undefined))

(assert (not (literal-test "string")))
(assert (not (literal-test "")))
(assert (not (literal-test [])))
(assert (not (literal-test {})))
(assert (not (literal-test 1)))
(assert (not (literal-test 3.14)))

(assert-eq* (concat [1 2] '(3) [4 5]) [1 2 3 4 5])

(defmacro def-cb (name args & code)
  (concat ['defn name (concat args '(cb))] code))
(defn echo (message) message)
(def-cb test-echo (message)
        (echo))

(assert-eq (test-echo "Hello" null) "Hello")

(assert-eq* '(1 2) [1 2])
(assert-eq* `(1 2) '(1 2))
(assert-eq* '(a b) ["a" "b"])
(assert-eq* '(a b) ['a 'b])
(assert-eq* `(a b) '(a b))

;;outside of (syntax-quote)
(assert-js
 "~num0"
 "unquote(num0);")

(assert-js
 "~@val"
 "unquoteSplicing(val);")


(defmacro zero-test? (num)
  `(= ~num 0))

(assert (zero-test? 0))
(assert (not (zero-test? 7)))

(defn zero-test-arg (x)
      (zero-test? x))

(assert (zero-test-arg 0))
(assert (not (zero-test-arg 1)))

(assert-js
 "`(start ~name ~@args 1)"
 "metajs.mergeSq([\"start\", name, [\"unquote-splicing\", args], 1]);")

(assert-js
 "(defmacro trinity (name & args)
    `(~name ~@args 3))
  (trinity func 1 2)"
 "func(1, 2, 3);")

(defmacro test-defn (name args & body)
  `(defn ~name ~args ~@body))

(test-defn my-max (a b)
         (if (and (number? a) (number? b))
           (if (> a b) a b)
           undefined))

(assert-eq (my-max 9 2) 9)
(assert-eq (my-max 1 0) 1)
(assert-eq (my-max 7 "str") undefined)


(assert-true (contains? "abc" "a"))
(assert-true (contains? [1 2] 1))
(assert-false (contains? "abc" "d"))
(assert-false (contains? [1 2] 3))
(assert-js
 "(contains? [1 2] 1)"
 "([1, 2].indexOf(1) !== -1);")

;;; unexpected \'&\' in signature
(assert-js* "(defmacro test-macro1 (x & y & z))"
           "Error: ")


(assert-js "`(log ~a ~(first (rest seq)) ~@people ~@(rest more))"
           "metajs.mergeSq([\"log\", a, (seq.slice(1))[0], [\"unquote-splicing\", people], [\"unquote-splicing\", more.slice(1)]]);")

(defmacro sq-test (a seq people & more)
  `(list ~a ~(first (rest seq)) ~@people ~@(rest more)))

(assert-eq* (sq-test "A" (1 2) ("U" "Me") 4 5 6)
            ["A" 2 "U" "Me" 5 6])


(defmacro test-gensym ()
  (def sym (gensym "my"))
  `(quote ~sym))

(assert (!= (test-gensym) (test-gensym)))

(defmacro gensym-pass ()
  (def temp-var (gensym))
  `(fn (x) (def ~temp-var x) ~temp-var))

(assert-eq ((gensym-pass) 5) 5)

(assert-js "(literal abc)" "abc;")
(assert-js "(literal \"abc\")" "abc;")
(assert-js "(literal 123)" "123;")
(assert-js "(literal true)" "true;")
(assert-js "(literal undefined)" "undefined;")

(assert-eq (do1 (+ 1 2) 11) 3)
