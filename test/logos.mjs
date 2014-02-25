;; Logos test

(defn hello (name) (str "Hello " name "!"))

;; root symbols are intentionally invisible to logos
;; for missed arguments resolution only closured (near) symbols are used
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


(defn get-username-timeline (username)
  #"$username timeline")

;;; name -> name
(let username "dogada"
     (assert-eq (get-username-timeline) "dogada timeline"))

;;; name -> meta
(let u:username "dogada"
     (assert-eq (get-username-timeline) "dogada timeline"))


(defn get-user-id-timeline (user-id:username)
  #"$user-id timeline")

;;; meta -> name
(let username "dogada"
     (assert-eq (get-user-id-timeline) "dogada timeline"))

;;; meta -> meta
(let u:username "dogada"
     (assert-eq (get-user-id-timeline) "dogada timeline"))

(entity request
        "Entity of demo web"
        (has username))

;; name -> entity -> name
(let request {username: "dogada"}
     (assert-eq (get-username-timeline) "dogada timeline"))

;; meta -> entity -> name
(let request {username: "dogada"}
     (assert-eq (get-user-id-timeline) "dogada timeline"))


;; name -> entity -> meta
(let req:request {username: "dogada"}
     (assert-eq (get-username-timeline) "dogada timeline"))

;; meta -> entity -> meta
(let req:request {username: "dogada"}
     (assert-eq (get-user-id-timeline) "dogada timeline"))


(entity heavy-request
        "Abstract web request with session that contains username of logged user and selected locale."
        (has [session url])
        (rel [username locale] `(. ~sym 'session ~rel)))

;; name -> entity -> name
(let heavy-request {session: {username: "dogada"}}
     (assert-eq (get-username-timeline) "dogada timeline"))

;; meta -> entity -> name
(let heavy-request {session: {username: "dogada"}}
     (assert-eq (get-user-id-timeline) "dogada timeline"))


;; name -> entity -> meta
(let req:heavy-request {session: {username: "dogada"}}
     (assert-eq (get-username-timeline) "dogada timeline"))

;; meta -> entity -> meta
(let req:heavy-request {session: {username: "dogada"}}
     (assert-eq (get-user-id-timeline) "dogada timeline"))


(entity nothing)
(entity null "more than nothing")

(entity rectangle
        "a shape that has four straight sides and four right angles at the corners"
        (meta {created: "20130901" author: "dogada"})
        (has x "left x")
        (has y "top y")
        (has [width:int height:int])
        (rel area `(* (get ~sym 'width) (get ~sym 'height)) "width x height"))

(entity circle
        "set of all points in a plane that are at a given distance from the centre"
        (meta {created: "20130901" author: "dogada"})
        (has x "center x")
        (has y "center y")
        (has radius)
        (rel area `(* Math.PI (Math.pow (get ~sym 'radius) 2)) "pi*r^2"))

(defn fill-region (x y width height color:0)
  #"$x,$y;$width*$height;$color")

(assert-eq (fill-region 2 3 10 20) "2,3;10*20;0")

;; name -> entity -> name
(let rectangle {x: 1 y: 2 width: 99 height: 87}
     (assert-eq (fill-region) "1,2;99*87;0")
     (assert-eq (fill-region 7) "7,2;99*87;0")
     (assert-eq (fill-region 7 8) "7,8;99*87;0")
     (assert-eq (fill-region 7 8 20) "7,8;20*87;0")
     (assert-eq (fill-region 7 8 20 30) "7,8;20*30;0")
     (assert-eq (fill-region 7 8 20 30 255) "7,8;20*30;255"))

;; name -> entity -> meta
(let r:rectangle {x: 2 y: 2 width: 99 height: 87}
     (assert-eq (fill-region) "2,2;99*87;0"))


(defn column-volume (area height)
  "Volume of a column rounded to nearest integer."
  (Math.round (* area height)))

(let figure:rectangle {x: 1 y: 2 width: 3 height: 4}
     (assert-eq (column-volume height:5) 60))

(let height 5
     (let figure:rectangle {x: 1 y: 2 width: 3 height: 4}
          (assert-eq (column-volume height:height) 60))
     (let figure:circle {x:0 y:0 radius:5}
          (assert-eq (column-volume) 393)))

;;; function parameters get from $scope via entities relations
(let $scope {x:1 y:2 z:3 data: {value: 10 inner: {x:100}}}
     (entity $scope (has [x y z data]))
     (defn add (x y)
       (+ x y))
     (assert-eq (add) 3)
     (assert-eq (add 10) 12)
     (assert-eq (add 5 6) 11)
     (assert-eq (add x y) 3)
     (assert-eq (add y z) 5)
     (assert-eq (add z 2) 5)
     (assert-eq (add 3 data.value) 13)
     (assert-eq (add 1 data.inner.x) 101)
     (assert-eq (add data.value data.inner.x) 110))

;;; function add, signature and parameters get from $scope
(let $scope {x:1 y:2 z:3 data: {value: 10 inner: {x:100}}
             add: (fn (x y) (+ x y))}
     (entity $scope
             (has [x y z data:dict])
             (fn add (x y)))
     (assert-eq (add) 3)
     (assert-eq (add 10) 12)
     (assert-eq (add 5 6) 11)
     (assert-eq (add x y) 3)
     (assert-eq (add y z) 5)
     (assert-eq (add z 2) 5)
     (assert-eq (add 3 data.value) 13)
     (assert-eq (add 1 data.inner.x) 101)
     (assert-eq (add data.value data.inner.x) 110)
     (assert-eq (get data 'value) 10)
     (assert-eq data.value 10)
     (assert-eq (get data.inner 'x) 100)
     (assert-eq (. data 'inner 'x) 100)
     (assert-eq data.inner.x 100)
     (set data.value 11)
     (assert-eq (get data 'value) 11)
     (assert-eq data.value 11)
     (set data.inner.x 101)
     (assert-eq (get data.inner 'x) 101)
     (assert-eq (+ data.value data.inner.x) 112)
     (assert-eq (- data.inner.x (get data 'value)) 90))
