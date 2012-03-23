$.extend
	ChartController:
		init : ($viz = 'visualization')->
			chartViz = ($ "<div id='#{@id}'></div>").appendTo $viz
#			chartButton = ($ "<input type='button' id='#{@id}-btn'>select chart</div>").appendTo $btn
#			chartButton.css("background-image", "url()");
#			chartButton.click @visible

			model = $.Model.get()
			view = new $.ChartView chartViz

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

					chartData =
						title : data.title
						source: data.source
						categories : categories
						sums : net_allocated

					view.setData chartData
					return)

			model.addListener mlist

			###
			Request the data from the model
			###
			# TODO create a "default slug" and make it accessible to all controllers
			model.getData "00_e4eee3e9f0e4"
			return
		id : 'chartViz'
		visible : (visible=true) ->
			# Yack. There must be a better way to access $.ChartController.id
			$("#" + $.ChartController.id).toggleClass "active",visible