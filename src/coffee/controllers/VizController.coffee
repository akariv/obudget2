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

			return

		showController : (cont) =>
			if (@_visCont? and @_visCont != cont)
				@_visCont.visible(false);
			@_visCont = cont
			cont.visible(true)
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


