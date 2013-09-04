# The DocPad Configuration File
# It is simply a CoffeeScript Object which is parsed by CSON
docpadConfig = {
        growl: true
	templateData:

		# Specify some site properties
		site:
			# The production url of our website
			url: "http://metajs.coect.net"

			# The default title of our website
			title: "metajs.coect.net"

			# The website description (for SEO)
			description: "Lisp compiled to Javascript"

			# The website keywords (for SEO) separated by commas
			keywords: """metajs,javascript,lisp"""

		getPreparedTitle: ->
			# if we have a document title, then we should use that and suffix the site's title onto it
			if @document.title
				"#{@document.title} | #{@site.title}"
			# if our document does not have it's own title, then we should just use the site's title
			else
				@site.title

		# Get the prepared site/document description
		getPreparedDescription: ->
			# if we have a document description, then we should use that, otherwise use the site's description
			@document.description or @site.description

		# Get the prepared site/document keywords
		getPreparedKeywords: ->
			# Merge the document keywords with the site keywords
			@site.keywords.concat(@document.keywords or []).join(', ')

}

# Export our DocPad Configuration
module.exports = docpadConfig
