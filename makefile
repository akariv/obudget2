all:  
	coffee -c -o src/app/js/ -j src/coffee/app.js \
	src/coffee/controllers/ControllerClass.coffee \
	src/coffee/controllers/ChartController.coffee \
	src/coffee/controllers/NavigationController.coffee \
	src/coffee/controllers/SearchController.coffee  \
	src/coffee/controllers/TableController.coffee  \
	src/coffee/controllers/VizController.coffee  \
	src/coffee/models/Model.coffee \
	src/coffee/utils/mustacheTemplates.coffee \
	src/coffee/utils/utils.coffee   \
	src/coffee/views/LineChartView.coffee \
	src/coffee/views/PieChartView.coffee  \
	src/coffee/views/TableView.coffee \
	src/coffee/app.coffee
	