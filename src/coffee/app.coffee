$(->
	model = new $.ChartModel
	view = new $.TableView $ "#container"
	controller = new $.TableController(model, view)
)
