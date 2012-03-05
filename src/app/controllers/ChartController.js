jQuery.extend({

	ChartController: function(model, view){
		/**
		 * listen to the model
		 */
		var mlist = $.ModelListener({
			loadItem : function(data){
				var sums = [];
				$.each(data.sums, function(index, value){
					sums.push({year: index, sums : value});
				});

				sums.sort(function(o1, o2){
					return parseInt(o1.year) > parseInt(o2.year) ? 1 : -1;
				});

				var net_allocated = [];
				var categories = [];
				$.each(sums,function(index, value){
					if (value.sums.net_allocated !== undefined) {
						net_allocated.push(value.sums.net_allocated);
						categories.push(value.year);
					}
				});

				// refresh the data in the chart
				view.line.xAxis[0].setCategories(categories, false);
				view.line.series[0].setData(net_allocated, false);
				view.line.redraw();
			}
		});
		model.addListener(mlist);

		// Request the data from the model
		model.getData();
	}

});