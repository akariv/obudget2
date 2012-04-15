(function() {
  var createVirtualItem, tableDef, _Singleton,
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
      this.createSingleYearView = function(div) {
        return new $.PieChartView(div);
      };
      this.createMultiYearView = function(div) {
        return new $.LineChartView(div);
      };
      this.onSubSection = function(subsection) {};
      ChartController.__super__.constructor.call(this, $viz);
      return;
    }

    ChartController.prototype.dataLoaded = function(budget) {
      var categories, latestYearData, mutliYearData, singleYearData, sums;
      singleYearData = [];
      latestYearData = budget.data[budget.data.length - 2];
      $.each(latestYearData.items, function(index, item) {
        if (item.values.net_allocated != null) {
          singleYearData.push([item.title, item.values.net_allocated]);
        } else {
          console.log("subsection " + item.title + " has no net_Allocated value.");
        }
      });
      this.getSingleYearView().setData(singleYearData);
      sums = [];
      categories = [];
      $.each(budget.data, function(index, yearData) {
        var currentYear, yearSum;
        currentYear = yearData.year;
        yearSum = 0;
        $.each(yearData.items, function(index, item) {
          if (item.values.net_allocated != null) {
            yearSum += item.values.net_allocated;
          }
        });
        sums.push(yearSum);
        categories.push(currentYear);
      });
      mutliYearData = {
        title: budget.title,
        source: budget.author,
        categories: categories,
        sums: sums
      };
      this.getMultiYearView().setData(mutliYearData);
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
        return new $.TableView(div, this.onSubSection);
      };
      this.createMultiYearView = function(div) {
        return new $.TableView(div);
      };
      this.onSubSection = function(subsection) {
        console.log("SubSection called");
      };
      TableController.__super__.constructor.call(this, $viz);
      return;
    }

    TableController.prototype.dataLoaded = function(budget) {
      var latestYearData, multiYearData, singleYearData;
      singleYearData = [];
      multiYearData = [];
      latestYearData = budget.data[budget.data.length - 2];
      $.each(latestYearData.items, function(index, item) {
        if (item.values.net_allocated != null) {
          singleYearData.push([parseInt(item.values.net_allocated), item.title, item.virtual_id]);
        } else {
          console.log("subsection " + item.title + " has no net_Allocated value.");
        }
      });
      this.getSingleYearView().setData(singleYearData);
      $.each(budget.data, function(index, yearData) {
        var currentYear, yearSum;
        currentYear = yearData.year;
        yearSum = 0;
        $.each(yearData.items, function(index, item) {
          if (item.values.net_allocated != null) {
            yearSum += item.values.net_allocated;
          }
        });
        multiYearData.push([yearSum, currentYear]);
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
        model.getData("/data/00");
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
      this.loadResponse = function(budget) {
        localStorage.setItem(budget.virtual_id, JSON.stringify(budget));
        that.loading = false;
        console.log("budget");
        console.log("******");
        console.log(budget);
        that.cache[budget.virtual_id] = budget;
        that.notifyItemLoaded(budget);
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
      if (this.loading) {
        return;
      } else {
        H.getRecord(slug, this.loadResponse);
        this.loading = true;
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

  createVirtualItem = function(data) {
    var budget, dataByYear, dataByYearSorted, vid;
    vid = data._src.substring(1 + data._src.lastIndexOf("/"));
    vid = vid.substring(0, vid.indexOf("_"));
    dataByYear = {};
    $.each(data.refs, function(index, value) {
      var current_year;
      if (!(dataByYear[value.year] != null)) {
        current_year = {
          year: value.year,
          items: []
        };
        current_year.items.push(value);
        dataByYear[value.year] = current_year;
      } else {
        dataByYear[value.year].items.push(value);
      }
    });
    dataByYearSorted = [];
    $.each(dataByYear, function(index, value) {
      return dataByYearSorted.push(value);
    });
    dataByYearSorted.sort(function(a, b) {
      if (a.year > b.year) {
        return 1;
      } else if (b.year > a.year) {
        return -1;
      } else {
        return 0;
      }
    });
    console.log(dataByYearSorted);
    budget = {};
    budget.title = data.title;
    budget.description = "תקציב " + data.title;
    budget.author = "התקציב הפתוח";
    budget.virtual_id = vid;
    budget.data = [];
    $.each(dataByYearSorted, function(index, value) {
      var budgetData;
      budgetData = {
        year: value.year
      };
      budgetData.items = [];
      $.each(value.items, function(index, value) {
        var dataValues, item;
        dataValues = {
          net_allocated: value.net_allocated,
          net_revised: value.net_revised,
          net_used: value.net_used,
          gross_revised: value.gross_revised,
          gross_used: value.gross_used
        };
        item = {
          virtual_id: value.code + "_" + value.title,
          budget_id: value.code,
          title: value.title,
          weight: 1.0,
          values: dataValues
        };
        budgetData.items.push(item);
      });
      budget.data.push(budgetData);
    });
    localStorage.setItem(budget.virtual_id, JSON.stringify(budget));
    return budget;
  };

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
    TableView: function($container, onSubSection) {
      var that;
      this.container = $container;
      that = this;
      that.onSubSection = onSubSection;
      this.setData = function(data) {
        var table;
        $('table', this.container).dataTable().fnClearTable(false);
        table = $('table', this.container).dataTable();
        table.fnAddData(data);
        if (that.onSubSection != null) {
          table.$('td').on("click", {
            name: "benny"
          }, function(a) {
            console.log(a);
            that.onSubSection();
          });
        }
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
      $('table', this.container).dataTable(tableDef);
    }
  });

  tableDef = {};

  tableDef.oLanguage = {
    "sProcessing": "מעבד...",
    "sLengthMenu": "הצג _MENU_ פריטים",
    "sZeroRecords": "לא נמצאו רשומות מתאימות",
    "sInfo": "_START_ עד _END_ מתוך _TOTAL_ רשומות",
    "sInfoEmpty": "0 עד 0 מתוך 0 רשומות",
    "sInfoFiltered": "(מסונן מסך _MAX_  רשומות)",
    "sInfoPostFix": "",
    "sSearch": "חפש:",
    "sUrl": "",
    "oPaginate": {
      "sFirst": "ראשון",
      "sPrevious": "קודם",
      "sNext": "הבא",
      "sLast": "אחרון"
    }
  };

}).call(this);
