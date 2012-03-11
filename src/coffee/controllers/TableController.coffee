$.extend
	TableController:
		init : ($container = 'visualization') ->
			tableViz = ($ "<div id='tableViz'></div>").appendTo $container
			model = new $.ChartModel
			view = new $.TableView tableViz

			###
			listen to the model
			###
			mlist = $.ModelListener(
				loadItem : (data) ->
					table = []
					$.each(data.sums, (index, value) ->
						if value.net_allocated?
							table.push [(parseInt value.net_allocated), index]
						return)

					view.setData table
					return)

			model.addListener mlist

			###
			Request the data from the model
			###
			model.getData()
			return

$.Visualization.controllers.push $.TableController