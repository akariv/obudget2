window.createVirtualItem = (data) ->
	vid = data._src.substring 1 + data._src.lastIndexOf "/"
	vid = vid.substring 0,vid.indexOf "_"

	dataByYear = {}
	$.each data.refs,(index, value) ->
		if not dataByYear[value.year]?
			current_year =
				year : value.year
				items : []
			current_year.items.push value
			dataByYear[value.year] = current_year
		else
			dataByYear[value.year].items.push value
		return

	# convert to array
	dataByYearSorted = []
	$.each dataByYear,(index, value) ->
		dataByYearSorted.push value

	dataByYearSorted.sort (a,b)->
		if a.year > b.year
			return 1
		else if b.year > a.year
			return -1
		else return 0
		return

	budget = {}
	budget.title = data.title
	budget.description = "תקציב " + data.title
	budget.author = "התקציב הפתוח"
	budget.virtual_id = vid
	budget.data = []

	# build data structure
	$.each dataByYearSorted,(index, value) ->
		budgetData =
			year : value.year

		budgetData.items = []
		$.each value.items,(index, value) ->
			dataValues =
				net_allocated : value.net_allocated
				net_revised : value.net_revised
				net_used : value.net_used
				gross_revised : value.gross_revised
				gross_used : value.gross_used

			item =
				virtual_id : value.code
				budget_id : value.code
				title : value.title
				weight : 1.0
				values : dataValues

			budgetData.items.push item
			return

		budget.data.push budgetData

		return

	localStorage.setItem budget.virtual_id, JSON.stringify budget
	return budget

