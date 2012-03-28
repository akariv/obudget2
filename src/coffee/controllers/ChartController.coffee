class $.ChartController
	constructor : ($viz = 'visualization')->
		@id = 'chartViz'
		@displayMultiYear = false

		@multiYearChartId = 'line'
		@singleYearChartId = 'pie'

		chartsViz = ($ "<div id='#{@id}'></div>").appendTo $viz
		lineChartViz = ($ "<div id='" + @multiYearChartId + "' class='viz'></div>").appendTo chartsViz
		pieChartViz = ($ "<div id='"+ @singleYearChartId + "' class='viz'></div>").appendTo chartsViz

		model = $.Model.get()
		@lineview = new $.LineChartView lineChartViz
		@pieview = new $.PieChartView pieChartViz

		@singleYearData = []
		@mutliYearData = null

		that = this

		###
		listen to the model
		###
		mlist = $.ModelListener(
			loadItem : (data) ->
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

				that.mutliYearData =
					title : data.title
					source: data.source
					categories : categories
					sums : net_allocated

				that.lineview.setData that.mutliYearData


				# Fetch from data.refs only the objects who's 'year' value is 2012
				currentYear = (ref for ref in data.refs when ref.year == 2011)

				# Take the net allocated value and display in the table
				$.each(currentYear, (index, value) ->
					if value.net_allocated?
						that.singleYearData.push [value.title, (parseInt value.net_allocated)]
					return)

				that.pieview.setData that.singleYearData

				return)


		model.addListener mlist

		return
	setMultiYear : (multiYear = true) ->
		if @displayMultiYear == multiYear
			# do nothing
		else
			$("#" + @id + " #" + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",false
			@displayMultiYear = multiYear

			$("#" + @id + " #" + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",true
		return
	chartIdByMultiYear : (multiYear) ->
		if multiYear
			return @multiYearChartId
		else
			return @singleYearChartId
	visible : (visible=true) ->
		$("#" + @id + " #" + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",visible

