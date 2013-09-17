(scoped
 (defn translate ()
   (def $mjs ($ this))
   ($mjs .parent .next .find "code" .text
         (try
           (metajs.reset-lint)
           (metajs.translate ($mjs.val))
           (catch e
               (str e.message "\nPlease look at console's log and fix errors.")))))

 (defn init-examples ()
   ($ "pre"
      .wrap "<div class=\"row sample\" />"
      .after "<div class=\"col-md-6\"><pre><code>js</code></pre>"
      .wrap "<div class=\"col-md-6\"><textarea class=\"mjs\"/></div>"
      .replaceWith #($ this .children .first .text))
   ($ "textarea.mjs"
      .each translate
      .on "keyup" translate))

 (defn make-toc ()
   ($ "h4" .each #(($ this) .attr "id" ($ this .text .toLowerCase .replace /\ /g "-"))))
 
 ($ init-examples)
 ($ make-toc))


