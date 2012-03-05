$(function(){
		var model = new $.ChartModel();
		var view = new $.ChartView($("#container"));
		chart1 = view.line;
		var controller = new $.ChartController(model, view);
});
