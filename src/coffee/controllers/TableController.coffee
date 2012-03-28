class $.TableController
	constructor : ($viz = 'visualization')->
		@id = 'tableViz'

		tableViz = ($ "<div id='#{@id}' class='viz'></div>").appendTo $viz

		model = $.Model.get()
		@view = new $.TableView tableViz

		@singleYearTable = []
		@mutliYearData = []

		that = this
		###
		listen to the model
		###
		mlist = $.ModelListener(
			loadItem : (data) ->
				# initialization
				that.singleYearTable = []
				that.mutliYearData = []

				# Fetch from data.refs only the objects who's 'year' value is 2012
				currentYear = (ref for ref in data.refs when ref.year == 2011)

				# Take the net allocated value and display in the table
				$.each(currentYear, (index, value) ->
					if value.net_allocated?
						that.singleYearTable.push [(parseInt value.net_allocated), value.title]
					return)

				that.view.setData that.singleYearTable

				# Create the multiYear data
				that.mutliYearData = []
				$.each(data.sums, (index, value) ->
					if value.net_allocated?
						that.mutliYearData.push [(parseInt value.net_allocated), index]
					return)

				return)

		model.addListener mlist

		return
	setMultiYear : (multiYear = true) ->
		if multiYear
			@view.setData @mutliYearData
		else
			@view.setData @singleYearTable
		return
	visible : (visible=true) ->
		$("#" + @id).toggleClass "active",visible

