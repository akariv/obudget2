$.extend
	OB :
		initControllers : ->
			$.Visualization.addController $.TableController
			$.Visualization.addController $.ChartController
		main : ->
			$.Visualization.initControllers ($ "#vis-contents"),$ "#vis-buttons"
			$.Visualization.showController $.Visualization.controllers()[0]
			return

		getURLParameter : (name) ->
			decodeURIComponent((RegExp('[?|&]' + name + '=' + '(.+?)(&|#|;|$)').exec(location.search) or ["",""])[1].replace(/\+/g, '%20')) or null
