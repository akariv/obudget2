$.extend
	ChartView : ($container)->
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