var chart1; // globally available
H.getRecord("/data/hasadna/budget-ninja/" + "0020_eef9f8e320e4e7e9f0e5ea", handleBudgetData);
$(document).ready(function() {
      chart1 = new Highcharts.Chart({
         chart: {
            renderTo: 'container',
            type: 'line'
         },
         title: {
            text: 'תקציב המדינה'
         },
         xAxis: {
             title: {
                 text: "שנה"
               }
         },
         yAxis: {
            title: {
               text: 'אלפי שקלים'
            },
            labels: {
                formatter: function() {
                  return this.value;
                }
              }
         },
         series: [{
            name: 'הקצאת תקציב - נטו',
            data: [0, 0]
         }]
      });
   });


function handleBudgetData(data){
	console.log(data);
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

	console.log(net_allocated);
	chart1.xAxis[0].setCategories(categories, false);
	chart1.series[0].setData(net_allocated, false);
	chart1.redraw();
	console.log("updated");
}