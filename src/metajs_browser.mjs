(include "./logos/javascript")

(scoped
 (def metajs {})
 (set-in window
         'metajs metajs
         'inspect (fn (obj) obj))

 (defn pr (x)
   (console.log x))

 (include "../src/core"))
