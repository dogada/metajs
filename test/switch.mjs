(defn switch-test (x)
  (switch x
           1 "one"
           2 (str "tw" "o")
           (3 4) (str "exactly " x)
           (5 6) (str x " for sure")
           "unknown"))

(assert-by2 =
            (switch-test 1) "one"
            (switch-test 2) "two"
            (switch-test 3) "exactly 3"
            (switch-test 4) "exactly 4"
            (switch-test 5) "5 for sure"
            (switch-test 6) "6 for sure"
            (switch-test 19) "unknown"
            (switch-test "str") "unknown"
            (switch-test) "unknown")

(defn switch-str (x)
  (switch x
           "one" 1
           'two 2
           ('three 'four) 34
           ('five "six") 56
           '(seven eight) 78
           1000))

(assert-by2 =
            (switch-str "one") 1
            (switch-str "two") 2
            (switch-str "three") 34
            (switch-str "four") 34
            (switch-str "five") 56
            (switch-str "six") 56
            (switch-str "seven") 78
            (switch-str "eight") 78
            (switch-str "many") 1000
            (switch-str) 1000)

