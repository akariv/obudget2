$.extend
	TableController:
		init : ($container = 'visualization') ->
			tableViz = ($ "<div id='#{@id}'></div>").appendTo $container
			model = $.Model.get()
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
		id : 'tableViz'

$.Visualization.controllers.push $.TableController