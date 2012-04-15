class $.ChartController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'chartViz'
		@createSingleYearView = (div)->
			new $.PieChartView div
		@createMultiYearView = (div)->
			new $.LineChartView div
		@onSubSection = (subsection) ->
			return

		super $viz
		return
	dataLoaded : (budget) =>
		singleYearData = []
		# Latest year
		latestYearData = budget.data[budget.data.length - 2]

		# Take the net allocated value and display in the table
		$.each latestYearData.items, (index, item) ->
			if item.values.net_allocated?
				singleYearData.push [item.title, item.values.net_allocated]
			else
				console.log "subsection " + item.title + " has no net_Allocated value."
			return

		@getSingleYearView().setData singleYearData

		# Create the multiYear data
		sums = []
		categories = []
		$.each budget.data, (index, yearData) ->
			currentYear = yearData.year
			yearSum = 0
			$.each yearData.items, (index, item) ->
				if item.values.net_allocated?
					yearSum += item.values.net_allocated
				return
			sums.push yearSum
			categories.push currentYear
			return

		mutliYearData =
			title : budget.title
			source: budget.author
			categories : categories
			sums : sums

		@getMultiYearView().setData mutliYearData

		return
