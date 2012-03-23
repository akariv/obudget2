$.extend
	Visualization:
		visibleCont : =>
			_visCont;
		controllers : =>
			if not @_controllers
				@_controllers = []
			@_controllers
		addController : (cont) ->
			# Yack. There must be a better way to access controllers
			controllers = $.Visualization.controllers()
			controllers.push cont

			return
		initControllers : ($vizContents, $visButtons)->
			for cont in $.Visualization.controllers()
				do (cont) ->
					cont.init $vizContents
					###
					add button to select the visualization represented bythe controller
					###
					button = $("<input type='button' class='vis-button' value='Show " + cont.id + "' id='vis-" + cont.id + "-button'/>")
					button.click  ->
						$.Visualization.showController cont
						return

					$visButtons.append button
					return

			###
			Add the Embed button
			###
			($ "#embed-widget").html 'Embed Code: <textarea></textarea>'

			###
			Year Span radio button selector
			###
			$("#yearspanform").change (event)->
  				console.log ($ ':checked',event.currentTarget).val()
  				return

			return

		showController : (cont) =>
			if (@_visCont? and @_visCont != cont)
				@_visCont.visible(false);
			@_visCont = cont
			cont.visible(true)
			($ "#embed-widget textarea").html '&lt;iframe width="560" height="315" src="VizEmbed.html?' + cont.id + '" &gt;&lt;/iframe&gt;'

			return
		controllerByType : (type) =>
			controllers = $.Visualization.controllers()
			console.log "controllers"
			console.log controllers
			cont = null
			$.each controllers,(index,value)->
				if value.id == type
					cont = value
					return
			return cont


