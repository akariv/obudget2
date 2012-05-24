#CR: If I understand correctly, this class assumes that each visualization has both a single and a multiple year view - which is not the case. In fact, I think that each chart should only have one "mode" (i.e. single/multi) - maybe the raw-data table can handle both modes, but that's the exception. The only thing the controller should know is which one is it, so it can adjust external controls accordingly.
#CR: I would expect that a controller wouldn't have any view-related functionality (i.e no HTML)
class $.Controller
	constructor : ($vizdiv)->

		@displayMultiYear = false
		@multiYearChartClass = 'multiYear'
		@singleYearChartClass = 'singleYear'

		@vizDiv = ($ "<div id='#{@id}'></div>").appendTo $vizdiv

		model = $.Model.get()

		that = this
		mlist = $.ModelListener
			loadItem : (data)->
				that.dataLoaded.call that,data
				return

		model.addListener mlist

		@getSingleYearView()
		@getMultiYearView()

		return
	setMultiYear : (multiYear = true) ->
		if @displayMultiYear == multiYear
			# do nothing
		else
			$("#" + @id + " ." + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",false
			@displayMultiYear = multiYear

			$("#" + @id + " ." + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",true
		return
	chartIdByMultiYear : (multiYear) ->
		if multiYear
			return @multiYearChartClass
		else
			return @singleYearChartClass
	visible : (visible=true) ->
		$("#" + @id + " ." + @chartIdByMultiYear(@displayMultiYear) ).toggleClass "active",visible
	getMultiYearView : ->
		if not @multiYearView?
			#id attribute is needed for highcharts
			multiYearViewDiv = ($ "<div id='" + @id + "_" + @multiYearChartClass + "' class='viz " + @multiYearChartClass + "'></div>").appendTo @vizDiv
			@multiYearView = @createMultiYearView multiYearViewDiv
		return @multiYearView

	getSingleYearView : ->
		if not @singleYearView?
			#id attribute is needed for highcharts
			singleYearViewDiv = ($ "<div id='" + @id + "_" + @singleYearChartClass + "' class='viz " + @singleYearChartClass + "'></div>").appendTo @vizDiv
			@singleYearView = @createSingleYearView singleYearViewDiv
		return @singleYearView

