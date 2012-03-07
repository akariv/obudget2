$(->
	model = new $.ChartModel
	view = new $.ChartView $ "#container"
	controller = new $.ChartController(model, view)
)
