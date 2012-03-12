$.Visualization = {}
$.Visualization.controllers = []

$(->


	for vizCon in $.Visualization.controllers
		vizCon.init $ "#vis-contents"

	$("#" + $.Visualization.controllers[0].id).toggleClass "active",true

	return

	###
	Add visualization button
	###


)
