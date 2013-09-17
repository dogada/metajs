(function() {
  var translate = (function() {
    var $mjs = $(this);
    return $mjs.parent().next().find("code").text((function() {
      try {
        metajs.resetLint();
        return metajs.translate($mjs.val());
      } catch (e) {
        return (e.message + "\nPlease look at console's log and fix errors.");
      }
    })());
  });
  var initExamples = (function() {
    $("pre").wrap("<div class=\"row sample\" />").after("<div class=\"col-md-6\"><pre><code>js</code></pre>").wrap("<div class=\"col-md-6\"><textarea class=\"mjs\"/></div>").replaceWith((function() {
      return $(this).children().first().text();
    }));
    return $("textarea.mjs").each(translate).on("keyup", translate);
  });
  var makeToc = (function() {
    return $("h4").each((function() {
      return $(this).attr("id", $(this).text().toLowerCase().replace(/\ /g, "-"));
    }));
  });
  $(initExamples);
  return $(makeToc);
})();

