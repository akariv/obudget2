(function() {
  var _Singleton,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    _this = this;

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

  $.Controller = (function() {

    function Controller($vizdiv) {
      var mlist, model, that;
      console.log("Controller constructor");
      this.displayMultiYear = false;
      this.multiYearChartClass = 'multiYear';
      this.singleYearChartClass = 'singleYear';
      this.vizDiv = ($("<div id='" + this.id + "'></div>")).appendTo($vizdiv);
      model = $.Model.get();
      that = this;
      mlist = $.ModelListener({
        loadItem: function(data) {
          that.dataLoaded.call(that, data);
        }
      });
      model.addListener(mlist);
      return;
    }

    Controller.prototype.setMultiYear = function(multiYear) {
      if (multiYear == null) multiYear = true;
      if (this.displayMultiYear === multiYear) {} else {
        $("#" + this.id + " ." + this.chartIdByMultiYear(this.displayMultiYear)).toggleClass("active", false);
        this.displayMultiYear = multiYear;
        $("#" + this.id + " ." + this.chartIdByMultiYear(this.displayMultiYear)).toggleClass("active", true);
      }
    };

    Controller.prototype.chartIdByMultiYear = function(multiYear) {
      if (multiYear) {
        return this.multiYearChartClass;
      } else {
        return this.singleYearChartClass;
      }
    };

    Controller.prototype.visible = function(visible) {
      if (visible == null) visible = true;
      return $("#" + this.id + " ." + this.chartIdByMultiYear(this.displayMultiYear)).toggleClass("active", visible);
    };

    Controller.prototype.getMultiYearView = function() {
      var multiYearViewDiv;
      if (!(this.multiYearView != null)) {
        multiYearViewDiv = ($("<div id='" + this.id + "_" + this.multiYearChartClass + "' class='viz " + this.multiYearChartClass + "'></div>")).appendTo(this.vizDiv);
        this.multiYearView = this.createMultiYearView(multiYearViewDiv);
      }
      return this.multiYearView;
    };

    Controller.prototype.getSingleYearView = function() {
      var singleYearViewDiv;
      if (!(this.singleYearView != null)) {
        singleYearViewDiv = ($("<div id='" + this.id + "_" + this.singleYearChartClass + "' class='viz " + this.singleYearChartClass + "'></div>")).appendTo(this.vizDiv);
        this.singleYearView = this.createSingleYearView(singleYearViewDiv);
      }
      return this.singleYearView;
    };

    return Controller;

  })();

  $.ChartController = (function(_super) {

    __extends(ChartController, _super);

    function ChartController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'chartViz';
      ChartController.__super__.constructor.call(this, $viz);
      return;
    }

    ChartController.prototype.createSingleYearView = function(div) {
      return new $.PieChartView(div);
    };

    ChartController.prototype.createMultiYearView = function(div) {
      return new $.LineChartView(div);
    };

    ChartController.prototype.dataLoaded = function(data) {
      var categories, currentYear, mutliYearData, net_allocated, ref, singleYearData, sums;
      singleYearData = [];
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
      mutliYearData = {
        title: data.title,
        source: data.source,
        categories: categories,
        sums: net_allocated
      };
      this.getMultiYearView().setData(mutliYearData);
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
          singleYearData.push([value.title, parseInt(value.net_allocated)]);
        }
      });
      this.getSingleYearView().setData(singleYearData);
    };

    return ChartController;

  })($.Controller);

  $.TableController = (function(_super) {

    __extends(TableController, _super);

    function TableController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'tableViz';
      this.createSingleYearView = function(div) {
        return new $.TableView(div);
      };
      this.createMultiYearView = this.createSingleYearView;
      TableController.__super__.constructor.call(this, $viz);
      return;
    }

    TableController.prototype.dataLoaded = function(data) {
      var currentYear, multiYearData, ref, singleYearData;
      singleYearData = [];
      multiYearData = [];
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
          singleYearData.push([parseInt(value.net_allocated), value.title]);
        }
      });
      this.getSingleYearView().setData(singleYearData);
      $.each(data.sums, function(index, value) {
        if (value.net_allocated != null) {
          multiYearData.push([parseInt(value.net_allocated), index]);
        }
      });
      this.getMultiYearView().setData(multiYearData);
    };

    return TableController;

  })($.Controller);

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
          var val;
          val = ($(':checked', event.currentTarget)).val();
          $.Visualization.visibleCont().setMultiYear(val === "true");
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
    LineChartView: function($container) {
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
    PieChartView: function($container) {
      var that;
      that = this;
      this.setData = function(data) {
        /*
        			refresh the data in the chart
        */        that.pie.series[0].setData(data, false);
        return that.pie.redraw();
      };
      this.pie = new Highcharts.Chart({
        chart: {
          renderTo: $container[0].id
        },
        title: {
          text: 'תקציב המדינה'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000'
            }
          }
        },
        series: [
          {
            type: 'pie',
            name: 'הקצאת תקציב - נטו',
            data: [['ma?', 33.0], ['mo?', 33.0], ['mi?', 90.9]]
          }
        ]
      });
    }
  });

  $.extend({
    TableView: function($container) {
      var that;
      this.container = $container;
      that = this;
      this.setData = function(data) {
        $('table', this.container).dataTable().fnClearTable(false);
        return $('table', this.container).dataTable().fnAddData(data);
      };
      this.container.html('\
		<table cellpadding="0" cellspacing="0" border="0" class="display">\
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
      $('table', this.container).dataTable();
    }
  });

}).call(this);
