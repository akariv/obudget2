$.extend
	TableController:
		init : ($viz = 'visualization')->
			tableViz = ($ "<div id='#{@id}'></div>").appendTo $viz

			model = $.Model.get()
			view = new $.TableView tableViz

			###
			listen to the model
			###
			mlist = $.ModelListener(
				loadItem : (data) ->
					# Fetch from data.refs only the objects who's 'year' value is 2012
					currentYear = (ref for ref in data.refs when ref.year == 2011)
					# Take the net allocated value and display in the table
					table = []
					#$.each(data.sums, (index, value) ->
					$.each(currentYear, (index, value) ->
						if value.net_allocated?
							table.push [(parseInt value.net_allocated), value.title]
						return)

					view.setData table
					return)

			model.addListener mlist

			###
			Request the data from the model
			###
			# TODO create a "default slug" and make it accessible to all controllers

			model.getData "00_e4eee3e9f0e4"
			return
		id : 'tableViz'
		visible : (visible=true) ->
			$("#" + $.TableController.id).toggleClass "active",visible