(function() {

  $.Visualization = {};

  $.Visualization.controllers = [];

  $(function() {
    var vizCon, _i, _len, _ref;
    _ref = $.Visualization.controllers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vizCon = _ref[_i];
      console.log(vizCon.init);
      vizCon.init($("#vis-contents"));
    }
    /*
    	Add visualization button
    */
  });

  $.extend({
    ChartController: {
      init: function($container) {
        var chartViz, mlist, model, view;
        if ($container == null) $container = 'visualization';
        chartViz = ($("<div id='chartViz'></div>")).appendTo($container);
        model = new $.ChartModel;
        view = new $.ChartView(chartViz);
        /*
        			listen to the model
        */
        mlist = $.ModelListener({
          loadItem: function(data) {
            var categories, chartData, net_allocated, sums;
            sums = [];
            $.each(data.sums, function(index, value) {
              sums.push({
                year: index,
                sums: value
              });
            });
            sums.sort(function(o1, o2) {
              if (parseInt(o1.year) > parseInt(o2.year)) {
                return 1;
              } else {
                return -1;
              }
            });
            net_allocated = [];
            categories = [];
            $.each(sums, function(index, value) {
              if (value.sums.net_allocated != null) {
                net_allocated.push(parseInt(value.sums.net_allocated));
                categories.push(value.year);
              }
            });
            chartData = {
              title: data.title,
              source: data.source,
              categories: categories,
              sums: net_allocated
            };
            view.setData(chartData);
          }
        });
        model.addListener(mlist);
        /*
        			Request the data from the model
        */
        model.getData();
      }
    }
  });

  $.Visualization.controllers.push($.ChartController);

  $.extend({
    TableController: {
      init: function($container) {
        var mlist, model, tableViz, view;
        if ($container == null) $container = 'visualization';
        tableViz = ($("<div id='tableViz'></div>")).appendTo($container);
        model = new $.ChartModel;
        view = new $.TableView(tableViz);
        /*
        			listen to the model
        */
        mlist = $.ModelListener({
          loadItem: function(data) {
            var table;
            table = [];
            $.each(data.sums, function(index, value) {
              if (value.net_allocated != null) {
                table.push([parseInt(value.net_allocated), index]);
              }
            });
            view.setData(table);
          }
        });
        model.addListener(mlist);
        /*
        			Request the data from the model
        */
        model.getData();
      }
    }
  });

  $.Visualization.controllers.push($.TableController);

  $.extend({
    ChartModel: function() {
      /*
      		our local cache  of data
      */
      var cache, listeners, loadResponse, that;
      cache = [];
      /*
      		a reference to ourselves
      */
      that = this;
      /*
      		who is listening to us?
      */
      listeners = [];
      /*
      		load a json response from an ajax call
      */
      loadResponse = function(data) {
        console.log(data);
        cache[data._src] = data;
        that.notifyItemLoaded(data);
      };
      this.getData = function(slug) {
        return H.getRecord("/data/hasadna/budget-ninja/" + "00_e4eee3e9f0e4", loadResponse);
      };
      /*
      		add a listener to this model
      */
      this.addListener = function(list) {
        listeners.push(list);
      };
      /*
      		tell everyone the item we've loaded
      */
      this.notifyItemLoaded = function(item) {
        $.each(listeners, function(i) {
          listeners[i].loadItem(item);
        });
      };
    },
    /*
    	allow people create listeners easily
    */
    ModelListener: function(list) {
      if (list == null) list = {};
      return $.extend({
        loadBegin: function() {},
        loadFinish: function() {},
        loadItem: function() {},
        loadFail: function() {}
      }, list);
    }
  });

  $.extend({
    ChartView: function($container) {
      var that;
      that = this;
      this.setData = function(data) {
        /*
        			refresh the data in the chart
        */        that.line.setTitle({
          text: "תקציב " + data.title
        }, {
          text: "מקור: " + data.source
        });
        that.line.xAxis[0].setCategories(data.categories, false);
        that.line.series[0].setData(data.sums, false);
        return that.line.redraw();
      };
      this.line = new Highcharts.Chart({
        chart: {
          renderTo: $container[0].id,
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
        series: [
          {
            name: 'הקצאת תקציב - נטו',
            data: [0, 0]
          }
        ]
      });
    }
  });

  $.extend({
    TableView: function($container) {
      this.setData = function(data) {
        $('#example').dataTable().fnClearTable(false);
        return $('#example').dataTable().fnAddData(data);
      };
      $container.html('\
		<table cellpadding="0" cellspacing="0" border="0" class="display" id="example">\
			<thead>\
				<tr>\
					<th>תקציב</th>\
					<th>שנה</th>\
				</tr>\
			</thead>\
			<tbody>\
				<tr class="odd gradeX">\
					<td>אין נתונים</td>\
					<td>1948</td>\
				</tr>\
			</tbody>\
		</table>\
		');
      $('#example').dataTable();
    }
  });

}).call(this);
