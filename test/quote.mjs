(let a 1 b "B" c undefined
     (assert-by2 =
                 (quote a) "a"
                 'a (quote a)
                 (eval (quote a)) 1
                 (quote "x") "\"x\""
                 (eval (quote "x")) "x"))


(assert-by2 metajs.deep-equal?
            (quote 'a) ["quote" "a"]
            (quote (quote a)) ["quote" "a"]
            (quote (quote 'a)) ["quote" ["quote" "a"]]
            '(a 1 "X") ["a" 1 "\"X\""]
            '(true false null undefined) ["true" "false" "null" "undefined"])

(defmacro sq-test (a b c:42 d:"\"hello\"" & more)
  `(str "List:" ~a ~b ~c ~d 100 ~@more))

(assert-eq (sq-test "A" 1) "List:A142hello100")
(assert-eq (sq-test "A" "B" "C") "List:ABChello100")
(assert-eq (sq-test "A" "B" "C" false 1 2) "List:ABCfalse10012")

(def d {a:1 my-id: 2 "hy-pen": 3}
  k 'my-id)

(assert-eq d.my-id (get d 'my-id))
(assert-eq d.my-id (get d k))
(assert-eq (get d "hy-pen") 3)



(assert-by2 =
            (quote x) "x"
            (quote my-x) "myX"
            (quote !) "__BANG"
            (quote set!) "set__BANG"
            (quote ?) "__QUERY"
            (quote is?) "is__QUERY"
            (quote -x) "__x"
            (quote -1) -1
            (quote +) "+"
            (quote -private-id) "__privateId"
            (quote long-public-id) "longPublicId"
            (quote >) ">"
            (quote -) "-"
            (quote --) "--"
            (quote ->) "->"
            (quote -->) "-->"
            (quote ->>) "->>"
            (metajs.js-literal "->") "->"
            (metajs.js-symbol "->") "->")
