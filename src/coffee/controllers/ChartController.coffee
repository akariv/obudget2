$.extend
	ChartController: (model, view) ->
		###
		listen to the model
		###
		mlist = $.ModelListener(
			loadItem : (data) ->
				sums = []
				$.each(data.sums, (index, value) ->
					sums.push
						year: index
						sums : value
					return)

				sums.sort (o1, o2) ->
					if parseInt(o1.year) > parseInt(o2.year) then 1 else -1

				net_allocated = []
				categories = []
				$.each(sums, (index, value) ->
					if value.sums.net_allocated?
						net_allocated.push parseInt value.sums.net_allocated
						categories.push value.year
					return)

				###
				refresh the data in the chart
				###
				view.line.setTitle(
					(text: "תקציב " + data.title),
					text: "מקור: " + data.source)
				view.line.xAxis[0].setCategories(categories, false)
				view.line.series[0].setData(net_allocated, false)
				view.line.redraw()
				return)

		model.addListener mlist

		###
		Request the data from the model
		###
		model.getData()
		return
