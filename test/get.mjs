(let obj {x: 1 b: "B" child: {id: 23 data: [1 2 3] status: {name: "ok"}}}
     x-key 'x
     child-key 'child
     (assert (= (get obj 'x) (get obj x-key) (. obj 'x) (. obj x-key)  1))
     (assert (= (. obj 'child 'id) (. obj child-key 'id) 23))
     (assert (= (. obj 'child 'id) (. obj child-key 'id) 23))
     (assert (= (. obj 'child 'data 0) (nth obj.child.data 0) 1))
     (assert (= (. obj 'child 'status 'name) "ok")))
