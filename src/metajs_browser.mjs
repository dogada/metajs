(include "./logos/javascript")
(include "./logos/browser")
(include "./logos/metajs")

(scoped
 (def metajs {})
 (set-in window
         'metajs metajs
         'inspect (fn (obj) obj))

 (defn pr (x)
   (console.log x))

 (include "../src/core"))
