$.extend
	ChartView : ($container)->
		that = this
		this.setData = (data) ->
			###
			refresh the data in the chart
			###
			that.line.setTitle(
				(text: "תקציב " + data.title),
				text: "מקור: " + data.source)
			that.line.xAxis[0].setCategories(data.categories, false)
			that.line.series[0].setData(data.sums, false)
			that.line.redraw()


		this.line = new Highcharts.Chart
			chart :
				renderTo : $container[0].id
				type : 'line'
			title :
				text : 'תקציב המדינה'
			xAxis :
				title :
					text : "שנה"
			yAxis :
				title :
					text : 'אלפי שקלים'
				labels :
					formatter : ->
						this.value;
			series : [ {
				name : 'הקצאת תקציב - נטו',
				data : [ 0, 0 ]
			} ]
		return