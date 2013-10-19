(scoped
 (defn init-repl ()
   "Put all MetaJS symbols into root scope for better REPL."
   (each-key key metajs
             (log "init-repl" (keys metajs))
             (set-in window key (get metajs key))))

 (defn translate ()
   (def $mjs ($ this)
     $pre ($mjs .parent .next)
     $run ($pre.find ".run"))
   ($pre .find "code" .text
         (try
           (metajs.reset-state)
           (do1
            (metajs.translate ($mjs.val))
            ($run.show))
           (catch e
               (log e.stack)
               ($run.hide)
               (str e.message "\nPlease look at console's log and fix errors.")))))
 (defn run ()
   (log "Eval result: " (eval (($ this) .parent .find "code" .text))))

 (defn init-examples ()
   ($ "pre"
      .wrap "<div class=\"row sample\" />"
      .after (str "<div class=\"col-md-6\"><pre><code>js</code>"
                  (if* (($ "#tepl") @length) "<button type=\"button\" class=\"btn btn-primary run\">Run</button>" "")
                  "</pre>")
      .wrap "<div class=\"col-md-6\"><textarea class=\"mjs\"/></div>"
      .replaceWith #($ this .children .first .text))
   ($ "textarea.mjs"
      .each translate
      .on "keyup" translate)
   ($ ".run"
      .on "click" run))

 (defn make-toc ()
   ($ "h4" .each #(($ this) .attr "id" ($ this .text .toLowerCase .replace /\ /g "-"))))

 ($ init-repl)
 ($ init-examples)
 ($ make-toc))
