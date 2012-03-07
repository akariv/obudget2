$.extend
	TableController: (model, view) ->
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
