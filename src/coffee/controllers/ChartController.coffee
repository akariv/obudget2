class $.ChartController
	constructor : ($viz = 'visualization')->
		@id = 'chartViz'

		chartViz = ($ "<div id='#{@id}'></div>").appendTo $viz

		model = $.Model.get()
		view = new $.ChartView chartViz

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

				chartData =
					title : data.title
					source: data.source
					categories : categories
					sums : net_allocated

				view.setData chartData
				return)

		model.addListener mlist

		return

	visible : (visible=true) ->
		$("#" + @id).toggleClass "active",visible

