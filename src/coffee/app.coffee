$.extend
	OB :
		initControllers : ->
			$.Visualization.addController $.TableController
			$.Visualization.addController $.ChartController
		main : ->
			$.Visualization.initControllers ($ "#vis-contents"),$ "#vis-buttons"
			$.Visualization.showController $.Visualization.controllers()[0]
			return

		###
		For use by the embed html
		###
		getURLParameter : (name) ->
			decodeURIComponent((RegExp('[?|&]' + name + '=' + '(.+?)(&|#|;|$)').exec(location.search) or ["",""])[1].replace(/\+/g, '%20')) or null
