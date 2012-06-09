#CR: Why didn't you use BBQ in the end?
class $.SingleYearTableController extends $.Controller
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'
		@createView = (div)->
				new $.TableView div,@onSubSection
		@onSubSection = (subsection) ->
			console.log History.getState()
			state = History.getState()
			History.pushState {vid:subsection[2], rand:Math.random()}, subsection[1], $.titleToUrl({title:subsection[1], vid:subsection[2]}) #CR: Please explain the rand thing...
			return

		super $viz
		return
	dataLoaded : (budget) =>
		# initialization
		data = []

		# Latest year
		# TODO, currently this is the last year.
		latestYearData = budget.components[budget.components.length - 2]

		# Take the net allocated value and display in the table
		$.each latestYearData.items, (index, item) ->
			if item.values.net_allocated?
				data.push [(parseInt item.values.net_allocated), item.title, item.virtual_id]
			else
				true
				#TODO - mark missing values.
			return

		@getView().setData data

		return

