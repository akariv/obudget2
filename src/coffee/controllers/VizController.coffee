$.extend
	Visualization:
		visibleCont : =>
			_visCont;
		controllers : =>
			if not @_controllers
				@_controllers = []
			@_controllers
		addController : (cont,$vizContents) ->
			# Yack. There must be a better way to access controllers
			controllers = $.Visualization.controllers()
			controllers.push new cont $vizContents

			return
		initControllers : ($visButtons)->
			model = $.Model.get()

			# set up the model listener
			mlist = $.ModelListener
				loadItem : (data)->
					# set navigation title
					($ "#navigator #ancestors").html Mustache.to_html ($ "#_navigator_ancestors").html(), data
					($ "#navigator #current_section").html Mustache.to_html ($ "#_navigator_current_section").html(), data

					# Set the facebook comments plugin for the current graph
					#$("#fbCommentsPlaceholder").html '<div class="fb-comments" data-href="http://obudget2.cloudfoundry.com/index.html#' + data.virtual_id + '" data-num-posts="2" data-width="470"></div>'
					if DISQUS?
						DISQUS.reset
							reload: true,
							config: ()->
								# refactor magic word 'disqus'
								window.disqus_identifier = this.page.identifier = "disqus" + data.virtual_id;
								window.disqus_url = this.page.url = "http://obudget2.cloudfoundry.com/index.html#!" + data.virtual_id;
								return
					return

			model.addListener mlist

			# Set up the url hash listener
			$(window).bind 'hashchange', (e) ->
				hash = $.param.fragment()
				console.log "**hash changed to " + hash
				model.getData hash
				return

			# initialize budget visualization
			if location.hash.length == 0
				location.hash = "00"
			else
				$(window).trigger 'hashchange'


			# TODO create a "default slug" and make it accessible to all controllers

			for cont in $.Visualization.controllers()
				do (cont) ->
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
			$("#multiYearForm").change (event)->
				val = ($ ':checked',event.currentTarget).val()
				$.Visualization.visibleCont().setMultiYear (val == "true")
				return


			return

		showController : (cont) =>
			if (@_visCont? and @_visCont != cont)
				@_visCont.visible(false);
			@_visCont = cont
			cont.visible(true)

			# set embedding text
			($ "#embed-widget textarea").html '&lt;iframe width="560" height="315" src="VizEmbed.html?' + cont.id + '" &gt;&lt;/iframe&gt;'

			return
		controllerByType : (type) =>
			controllers = $.Visualization.controllers()
			cont = null
			$.each controllers,(index,value)->
				if value.id == type
					cont = value
					return
			return cont


