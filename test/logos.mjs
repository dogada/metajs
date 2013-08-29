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

(defn root-test ()
  (def hello-str (hello))
  (assert (= hello-str "Hello undefined!") "hello in root-test (name)"))

(root-test)
