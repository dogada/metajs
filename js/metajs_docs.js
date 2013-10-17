(function() {
  var translate = (function() {
    var $mjs = $(this),
    $pre = $mjs.parent().next(),
    $run = $pre.find(".run");
    return $pre.find("code").text((function() {
      try {
        metajs.resetState();
        return (function() {
          var G__1 = metajs.translate($mjs.val());
          $run.show();
          return G__1;
        })();
      } catch (e) {
        console.log(e.stack);
        $run.hide();
        return (e.message + "\nPlease look at console's log and fix errors.");
      }
    })());
  });
  var run = (function() {
    return console.log("Eval result: ", eval($(this).parent().find("code").text()));
  });
  var initExamples = (function() {
    $("pre").wrap("<div class=\"row sample\" />").after(("<div class=\"col-md-6\"><pre><code>js</code>" + ($("#tepl").length ? "<button type=\"button\" class=\"btn btn-primary run\">Run</button>" : "") + "</pre>")).wrap("<div class=\"col-md-6\"><textarea class=\"mjs\"/></div>").replaceWith((function() {
      return $(this).children().first().text();
    }));
    $("textarea.mjs").each(translate).on("keyup", translate);
    return $(".run").on("click", run);
  });
  var makeToc = (function() {
    return $("h4").each((function() {
      return $(this).attr("id", $(this).text().toLowerCase().replace(/\ /g, "-"));
    }));
  });
  $(initExamples);
  return $(makeToc);
})();

