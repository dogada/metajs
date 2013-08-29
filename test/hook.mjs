(let ls [1 2 3 4]
     (defn get-ls () ls)
     (assert-eq (ls @1) 2)
     (assert-eq ls.length 4)
     (assert-eq (ls @length) 4)
     (assert-eq* (ls .slice 2) [3 4])
     (assert-eq* ((get-ls) .slice 2) [3 4])
     (assert-eq* (ls.slice 2) [3 4])
     (assert-eq* (ls .slice 2 3) [3])
     (assert-eq* ((get-ls) .slice 2 3) [3])
     (assert-eq* ((get-ls).slice 2 3) [3])
     (assert-eq* (ls.slice 2 3) [3])
     (assert-eq* (ls .slice 0 .slice 1 -1) [2 3])
     (assert-eq* ((get-ls) .slice 0 .slice 1 -1) [2 3])
     (assert-eq* ((get-ls).slice 0 .slice 1 -1) [2 3])
     (assert-eq* (((get-ls) .slice 0 .slice 1 -1) @length) 2)
     (assert-eq* ((get-ls) .slice 0 .slice 1 -1 @length) 2))

(let xs [1 2 3 4 5]
     (defn get-data (ls) ls)
     (assert-by-2 =
                  (get-data [1 2 3] .slice 1 @0) 2
                  (get-data ls:[1 2 3] .slice 1 @0) 2
                  (get-data [1 2 3] .slice  @0) 1
                  (get-data [1 2 3] .slice .slice 1 -1  @0) 2
                  (-> xs (slice 1) (.slice 2) (@length)) 2
                  (xs .slice .slice 1 @1) 3
                  ((rest xs) .slice -1 @0) 5
                  ((rest xs) .slice .slice -1 @0) 5
                  (rest xs .slice -1 @0) 5
                  (rest xs .slice .slice -1 @0) 5
                  (slice xs 0 2 .slice 0 -1 @0) 1
                  (metajs.prn-str '(rest xs .slice -1 @0)) "(rest xs .slice -1 @0)"))

(let status {id: 1 text: "Hello" user: {screen_name: "buddy"}}
     (defn get-status () status)
     (assert-eq status.id 1)
     (assert-eq (get (get-status) 'id) 1)
     (assert-eq (status @id) 1)
     (assert-eq ((get-status) @text) "Hello")
     (assert-eq ((get-status) @user @screen_name) "buddy")
     (assert-eq ((get-status) .hasOwnProperty 'id) true)
     (assert-eq ((. (get-status) 'user) .hasOwnProperty 'xyz) false)
     (assert-eq ((get-status) @user .hasOwnProperty 'xyz) false)
     (assert-eq ((get-status) @user .hasOwnProperty 'screen_name) true)
     (assert-eq ((get-status) @user @screen_name .slice 0 3 @length) 3))



