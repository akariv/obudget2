$.extend
	OB :
		initControllers : ->
			# TODO find a better way to add controllers. The suggested way duplicates passing parameters both here and in the initController function.
			$.Visualization.addController $.TableController,$ "#vis-contents"
			$.Visualization.addController $.ChartController,$ "#vis-contents"

			return
		main : ->
			$.Visualization.initControllers $("#vis-buttons")
			$.Visualization.showController $.Visualization.controllers()[0]

			search = new $.Search ($ "#searchbox input"), ($ "#searchresults")
			search.init()
			return

		###
		For use by the embed html
		###
		getURLParameter : (name) ->
			decodeURIComponent((RegExp('[?|&]' + name + '=' + '(.+?)(&|#|;|$)').exec(location.search) or ["",""])[1].replace(/\+/g, '%20')) or null
