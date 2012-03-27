class $.TableController
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'

		tableViz = ($ "<div id='#{@id}'></div>").appendTo $viz

		model = $.Model.get()
		@view = new $.TableView tableViz
		view = @view

		singleYearTable = []
		@singleYearTable = singleYearTable
		mutliYearData = []
		@mutliYearData = mutliYearData

		###
		listen to the model
		###
		mlist = $.ModelListener(
			loadItem : (data) ->
				# initialization
				singleYearTable = []
				mutliYearData = []

				# Fetch from data.refs only the objects who's 'year' value is 2012
				currentYear = (ref for ref in data.refs when ref.year == 2011)

				# Take the net allocated value and display in the table
				$.each(currentYear, (index, value) ->
					if value.net_allocated?
						singleYearTable.push [(parseInt value.net_allocated), value.title]
					return)
				view.setData singleYearTable

				# Create the multiYear data
				mutliYearData = []
				$.each(data.sums, (index, value) ->
					if value.net_allocated?
						mutliYearData.push [(parseInt value.net_allocated), index]
					return)

				return)

		model.addListener mlist

		return
	setYearSpan : (multiYear = true) ->
		if multiYear
			@view.setData @mutliYearData
		else
			@view.setData @singleYearTable
		return
	visible : (visible=true) ->
		$("#" + @id).toggleClass "active",visible

