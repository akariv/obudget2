class $.TableController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'
		@createSingleYearView = (div)->
				new $.TableView div
		@createMultiYearView = @createSingleYearView

		super $viz
		return
	dataLoaded : (data) =>
		# initialization
		singleYearData = []
		multiYearData = []

		# Fetch from data.refs only the objects who's 'year' value is 2012
		currentYear = (ref for ref in data.refs when ref.year == 2011)

		# Take the net allocated value and display in the table
		$.each(currentYear, (index, value) ->
			if value.net_allocated?
				singleYearData.push [(parseInt value.net_allocated), value.title]
			return)

		@getSingleYearView().setData singleYearData

		# Create the multiYear data
		$.each(data.sums, (index, value) ->
			if value.net_allocated?
				multiYearData.push [(parseInt value.net_allocated), index]
			return)

		@getMultiYearView().setData multiYearData

		return

