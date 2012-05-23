#CR: Why didn't you use BBQ in the end?
class $.TableController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'
		@createSingleYearView = (div)->
				new $.TableView div,@onSubSection
		@createMultiYearView = (div)->
				new $.TableView div
		@onSubSection = (subsection) ->
			console.log History.getState()
			state = History.getState()
			History.pushState {vid:subsection[2], rand:Math.random()}, subsection[1], $.titleToUrl({title:subsection[1], vid:subsection[2]}) #CR: Please explain the rand thing...
			return

		super $viz
		return
	dataLoaded : (budget) =>
		# initialization
		singleYearData = []
		multiYearData = []

		# Latest year
		# TODO, currently this is the last year.
		latestYearData = budget.components[budget.components.length - 2]

		# Take the net allocated value and display in the table
		$.each latestYearData.items, (index, item) ->
			if item.values.net_allocated?
				singleYearData.push [(parseInt item.values.net_allocated), item.title, item.virtual_id]
			else
				true
				#TODO - mark missing values.
			return

		@getSingleYearView().setData singleYearData

		# Create the multiYear data
		$.each budget.components, (index, yearData) ->
			currentYear = yearData.year
			yearSum = 0
			$.each yearData.items, (index, item) ->
				if item.values.net_allocated?
					yearSum += item.values.net_allocated
				return
			# setData expects an array of 3 object items
			if yearSum > 0
				multiYearData.push [yearSum, currentYear, currentYear]
			return

		@getMultiYearView().setData multiYearData

		return

