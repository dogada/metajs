;; Logos test

(defn hello (name) (str "Hello " name "!"))
(def name "root name")

(defn func-arg-test (name)
  (def hello-str (hello))
  (assert (> (hello-str.indexOf name) -1) "hello in func-arg-test(name)")
  hello-str)

(func-arg-test "World")

(defn parent-test (id)
  (defn child (name)
    (def hello-str (hello))
    (assert (> (hello-str.indexOf name) -1) "hello in child(name)")
    hello-str)
  (child id))

(parent-test "Parent")

;; Error(2): name is required for hello
(assert-js* "(defn root-test () (hello))" "Error")
