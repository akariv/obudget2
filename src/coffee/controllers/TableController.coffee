class $.TableController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'
		@createSingleYearView = (div)->
				new $.TableView div,@onSubSection
		@createMultiYearView = (div)->
				new $.TableView div
		@onSubSection = (subsection) ->
			console.log "SubSection called"
			return

		super $viz
		return
	dataLoaded : (budget) =>
		# initialization
		singleYearData = []
		multiYearData = []

		# Latest year
		latestYearData = budget.data[budget.data.length - 2]

		# Take the net allocated value and display in the table
		$.each latestYearData.items, (index, item) ->
			if item.values.net_allocated?
				singleYearData.push [(parseInt item.values.net_allocated), item.title, item.virtual_id]
			else
				console.log "subsection " + item.title + " has no net_Allocated value."
			return

		@getSingleYearView().setData singleYearData

		# Create the multiYear data
		$.each budget.data, (index, yearData) ->
			currentYear = yearData.year
			yearSum = 0
			$.each yearData.items, (index, item) ->
				if item.values.net_allocated?
					yearSum += item.values.net_allocated
				return
			multiYearData.push [yearSum, currentYear]
			return

		@getMultiYearView().setData multiYearData

		return

