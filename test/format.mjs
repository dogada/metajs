(assert-by-2 =
             (fmt "Hello!") "Hello!"
             (fmt "") ""
             (fmt "$10.99") "$10.99"
             (fmt "$$10.99") "$10.99")

(let name "Stas" score 100
     (assert-by-2 =
                  (fmt "Hello, $name!") "Hello, Stas!"
                  (fmt "Hello, $name! Score: $score.") "Hello, Stas! Score: 100."
                  #"$name" "Stas"
                  #"Hello, $name! Score: $score." "Hello, Stas! Score: 100."
                  #"Score: $score. Balance $$100.21." "Score: 100. Balance $100.21."
                  #"Escape: $$var" "Escape: $var"
                  #"Debug: $=name, $=score." "Debug: name='Stas', score=100."
                  ))
