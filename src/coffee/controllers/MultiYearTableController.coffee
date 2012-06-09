#CR: Why didn't you use BBQ in the end?
class $.MultiYearTableController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'
		@createView = (div)->
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
		data = 
                          title1: "שנה"
                          title2: "תקציב"
                          values: []
                         

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
				data.values.push [yearSum, currentYear, currentYear]
			return

		@getView().setData data

		return

