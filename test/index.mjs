(def metajs (require "../lib/metajs_node"))

(set-in metajs '*assert-handler* metajs.test-handler)
(console.log (str "Testing " (metajs.version-string)))

(include "../src/runtime.mjs")

(include "./reader.mjs")
(include "./if.mjs")
(include "./while.mjs")
(include "./macros.mjs")
(include "./function.mjs")
(include "./object.mjs")
(include "./logos.mjs")
(include "./def.mjs")
(include "./get.mjs")
(include "./set.mjs")
(include "./let.mjs")
(include "./raw.mjs")
(include "./try.mjs")
(include "./chaining.mjs")
(include "./assert.mjs")
(include "./checking.mjs")
(include "./list.mjs")
(include "./quote.mjs")
(include "./switch.mjs")
(include "./hook.mjs")
(include "./yield.mjs")
(include "./format.mjs")

(include "./last.mjs")

(metajs.print-testing-state)

