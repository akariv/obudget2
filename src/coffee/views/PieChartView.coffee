$.extend
	PieChartView : ($container)->
		that = this
		this.setData = (data) ->
			###
			refresh the data in the chart
			###
			that.pie.series[0].setData(data, false)
			that.pie.redraw()


		this.pie = new Highcharts.Chart
			chart :
				renderTo : $container[0].id
			title :
				text : 'תקציב המדינה'
			plotOptions:
				pie:
					allowPointSelect: true
					cursor: 'pointer'
					dataLabels:
						enabled: true
						color: '#000000'
						connectorColor: '#000000'
			credits:
				enabled: true
				text: 'התקציב הפתוח 2.0'
				href: 'http://obudget2.cloudfoundry.com'
			series : [ {
				type : 'pie',
				name : 'הקצאת תקציב - נטו',
				data : [
					[ 'ma?', 33.0 ]
					[ 'mo?', 33.0 ]
					[ 'mi?', 90.9 ]
					]
			} ]
		return
