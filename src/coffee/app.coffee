$.Visualization = {}
$.Visualization.controllers = []

$(->


	for vizCon in $.Visualization.controllers
		console.log vizCon.init
		vizCon.init $ "#vis-contents"

#	model = new $.ChartModel
#	view = new $.ChartView $ "#vis-contents"
#	controller = $.ChartController.init(model, view)

	return
	###
	Add visualization button
	###


)
