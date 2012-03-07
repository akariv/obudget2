(function() {

  $(function() {
    var controller, model, view;
    model = new $.ChartModel;
    view = new $.TableView($("#container"));
    return controller = new $.TableController(model, view);
  });

  $.extend({
    ChartController: function(model, view) {
      /*
      		listen to the model
      */
      var mlist;
      mlist = $.ModelListener({
        loadItem: function(data) {
          var categories, net_allocated, sums;
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
          /*
          				refresh the data in the chart
          */
          view.line.setTitle({
            text: "תקציב " + data.title
          }, {
            text: "מקור: " + data.source
          });
          view.line.xAxis[0].setCategories(categories, false);
          view.line.series[0].setData(net_allocated, false);
          view.line.redraw();
        }
      });
      model.addListener(mlist);
      /*
      		Request the data from the model
      */
      model.getData();
    }
  });

  $.extend({
    TableController: function(model, view) {
      /*
      		listen to the model
      */
      var mlist;
      mlist = $.ModelListener({
        loadItem: function(data) {
          var table;
          table = [];
          $.each(data.sums, function(index, value) {
            if (value.net_allocated != null) {
              console.log(index);
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
  });

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
