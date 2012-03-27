(function() {
  var _Singleton,
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $.extend({
    OB: {
      initControllers: function() {
        $.Visualization.addController($.TableController, $("#vis-contents"), $("#vis-buttons"));
        $.Visualization.addController($.ChartController, $("#vis-contents"), $("#vis-buttons"));
      },
      main: function() {
        $.Visualization.initControllers($("#vis-contents"), $("#vis-buttons"));
        $.Visualization.showController($.Visualization.controllers()[0]);
      },
      /*
      		For use by the embed html
      */
      getURLParameter: function(name) {
        return decodeURIComponent((RegExp('[?|&]' + name + '=' + '(.+?)(&|#|;|$)').exec(location.search) || ["", ""])[1].replace(/\+/g, '%20')) || null;
      }
    }
  });

  $.ChartController = (function() {

    function ChartController($viz) {
      var chartViz, mlist, model, view;
      if ($viz == null) $viz = 'visualization';
      this.id = 'chartViz';
      chartViz = ($("<div id='" + this.id + "'></div>")).appendTo($viz);
      model = $.Model.get();
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
      return;
    }

    ChartController.prototype.visible = function(visible) {
      if (visible == null) visible = true;
      return $("#" + this.id).toggleClass("active", visible);
    };

    return ChartController;

  })();

  $.TableController = (function() {

    function TableController($viz) {
      var mlist, model, mutliYearData, singleYearTable, tableViz, view;
      if ($viz == null) $viz = 'visualization';
      this.id = 'tableViz';
      tableViz = ($("<div id='" + this.id + "'></div>")).appendTo($viz);
      model = $.Model.get();
      this.view = new $.TableView(tableViz);
      view = this.view;
      singleYearTable = [];
      this.singleYearTable = singleYearTable;
      mutliYearData = [];
      this.mutliYearData = mutliYearData;
      /*
      		listen to the model
      */
      mlist = $.ModelListener({
        loadItem: function(data) {
          var currentYear, ref;
          singleYearTable = [];
          mutliYearData = [];
          currentYear = (function() {
            var _i, _len, _ref, _results;
            _ref = data.refs;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              ref = _ref[_i];
              if (ref.year === 2011) _results.push(ref);
            }
            return _results;
          })();
          $.each(currentYear, function(index, value) {
            if (value.net_allocated != null) {
              singleYearTable.push([parseInt(value.net_allocated), value.title]);
            }
          });
          view.setData(singleYearTable);
          mutliYearData = [];
          $.each(data.sums, function(index, value) {
            if (value.net_allocated != null) {
              mutliYearData.push([parseInt(value.net_allocated), index]);
            }
          });
        }
      });
      model.addListener(mlist);
      return;
    }

    TableController.prototype.setYearSpan = function(multiYear) {
      if (multiYear == null) multiYear = true;
      if (multiYear) {
        this.view.setData(this.mutliYearData);
      } else {
        this.view.setData(this.singleYearTable);
      }
    };

    TableController.prototype.visible = function(visible) {
      if (visible == null) visible = true;
      return $("#" + this.id).toggleClass("active", visible);
    };

    return TableController;

  })();

  $.extend({
    Visualization: {
      visibleCont: function() {
        return _visCont;
      },
      controllers: function() {
        if (!_this._controllers) _this._controllers = [];
        return _this._controllers;
      },
      addController: function(cont, $vizContents, $visButtons) {
        var controllers;
        controllers = $.Visualization.controllers();
        controllers.push(new cont($vizContents));
      },
      initControllers: function($vizContents, $visButtons) {
        var cont, model, _fn, _i, _len, _ref;
        model = $.Model.get();
        model.getData("00_e4eee3e9f0e4");
        _ref = $.Visualization.controllers();
        _fn = function(cont) {
          /*
          					add button to select the visualization represented bythe controller
          */
          var button;
          button = $("<input type='button' class='vis-button' value='Show " + cont.id + "' id='vis-" + cont.id + "-button'/>");
          button.click(function() {
            $.Visualization.showController(cont);
          });
          $visButtons.append(button);
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cont = _ref[_i];
          _fn(cont);
        }
        /*
        			Add the Embed button
        */
        ($("#embed-widget")).html('Embed Code: <textarea></textarea>');
        /*
        			Year Span radio button selector
        */
        $("#multiYearForm").change(function(event) {
          console.log(($(':checked', event.currentTarget)).val());
          $.Visualization.visibleCont().setYearSpan(true);
        });
      },
      showController: function(cont) {
        if ((_this._visCont != null) && _this._visCont !== cont) {
          _this._visCont.visible(false);
        }
        _this._visCont = cont;
        cont.visible(true);
        ($("#embed-widget textarea")).html('&lt;iframe width="560" height="315" src="VizEmbed.html?' + cont.id + '" &gt;&lt;/iframe&gt;');
      },
      controllerByType: function(type) {
        var cont, controllers;
        controllers = $.Visualization.controllers();
        cont = null;
        $.each(controllers, function(index, value) {
          if (value.id === type) cont = value;
        });
        return cont;
      }
    }
  });

  $.Model = (function() {
    var _instance;

    function Model() {}

    _instance = void 0;

    Model.get = function(args) {
      return _instance != null ? _instance : _instance = new _Singleton(args);
    };

    return Model;

  })();

  _Singleton = (function() {

    function _Singleton(args) {
      var that;
      this.args = args;
      this.addListener = __bind(this.addListener, this);
      this.getData = __bind(this.getData, this);
      that = this;
      /*
      		our local cache  of data
      */
      this.cache = [];
      /*
      		who is listening to us?
      */
      this.listeners = [];
      this.loading = false;
      /*
      		load a json response from an ajax call
      */
      this.loadResponse = function(data) {
        var slug;
        that.loading = false;
        console.log(data);
        that.cache[data._src] = data;
        that.notifyItemLoaded(data);
        slug = data._src.substring((data._src.lastIndexOf('/')) + 1);
        localStorage.setItem("ob_data" + slug, JSON.stringify(data));
      };
      /*
      		tell everyone the item we've loaded
      */
      this.notifyItemLoaded = function(item) {
        $.each(that.listeners, function(i) {
          that.listeners[i].loadItem(item);
        });
      };
    }

    _Singleton.prototype.getData = function(slug) {
      var data;
      if (this.loading) {
        return;
      } else {
        data = JSON.parse(localStorage.getItem("ob_data" + slug));
        if (data != null) {
          this.loadResponse(data);
        } else {
          H.getRecord("/data/hasadna/budget-ninja/" + slug, this.loadResponse);
          this.loading = true;
        }
      }
    };

    /*
    	add a listener to this model
    */

    _Singleton.prototype.addListener = function(list) {
      this.listeners.push(list);
    };

    return _Singleton;

  })();

  $.extend({
    /*
    	allow people to create listeners easily
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
					<td>1234.0</td>\
					<td>1948</td>\
				</tr>\
			</tbody>\
		</table>\
		');
      $('#example').dataTable();
    }
  });

}).call(this);
