class $.ChartController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'chartViz'

		super $viz
		return
	createSingleYearView : (div)->
		new $.PieChartView div
	createMultiYearView : (div)->
		new $.LineChartView div
	dataLoaded : (data) =>
		singleYearData = []
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

		mutliYearData =
			title : data.title
			source: data.source
			categories : categories
			sums : net_allocated

		@getMultiYearView().setData mutliYearData


		# Fetch from data.refs only the objects who's 'year' value is 2012
		currentYear = (ref for ref in data.refs when ref.year == 2011)

		# Take the net allocated value and display in the table
		$.each(currentYear, (index, value) ->
			if value.net_allocated?
				singleYearData.push [value.title, (parseInt value.net_allocated)]
			return)

		@getSingleYearView().setData singleYearData

		return
