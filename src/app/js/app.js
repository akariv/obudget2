(function() {
  var tableDef, _Singleton_Model,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    _this = this;

  $.extend({
    OB: {
      initControllers: function() {
        $.Visualization.addController($.TableController, $("#vis-contents"));
        $.Visualization.addController($.ChartController, $("#vis-contents"));
      },
      main: function() {
        var search;
        $.Visualization.initControllers($("#vis-buttons"));
        $.Visualization.showController($.Visualization.controllers()[0]);
        search = new $.Search($("#searchbox input"), $("#searchresults"));
        search.init();
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
      this.getSingleYearView();
      this.getMultiYearView();
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
      var categories, emptyItems, latestYearData, mutliYearData, singleYearData, sums;
      singleYearData = [];
      latestYearData = budget.data[budget.data.length - 2];
      emptyItems = [];
      $.each(latestYearData.items, function(index, item) {
        if (item.values.net_allocated != null) {
          singleYearData.push([item.title, item.values.net_allocated]);
        } else {
          emptyItems.push(item.title);
        }
      });
      console.log("subsections with no net_allocated value:");
      console.log("****************");
      console.log(emptyItems);
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
        if (yearSum > 0) {
          sums.push(yearSum);
          categories.push(currentYear);
        }
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

  $.NavigationController = (function() {

    function NavigationController() {
      this;      return;
    }

    return NavigationController;

  })();

  $.Search = (function() {

    function Search($searchbox, $searchresults) {
      this.$searchbox = $searchbox;
      this.$searchresults = $searchresults;
      return;
    }

    Search.prototype.init = function() {
      var searchbox, searchresults;
      searchbox = this.$searchbox;
      searchresults = this.$searchresults;
      this.$searchbox.keypress(function(e) {
        var url;
        if (e.keyCode === 13) {
          console.log(searchbox.val());
          url = "http://budget.msh.gov.il/00?text=" + searchbox.val() + "&full=1&num=20&distinct=1";
          $.get(url, function(data) {
            data = {
              searchresults: data
            };
            return searchresults.html(Mustache.to_html(($("#_" + searchresults[0].id)).html(), data));
          }, "jsonp");
          e.preventDefault();
        }
      });
    };

    return Search;

  })();

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
        var state;
        console.log(History.getState());
        state = History.getState();
        History.pushState({
          vid: subsection[2],
          rand: Math.random()
        }, subsection[1], $.titleToUrl({
          title: subsection[1],
          vid: subsection[2]
        }));
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
        if (yearSum > 0) multiYearData.push([yearSum, currentYear, currentYear]);
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
      addController: function(cont, $vizContents) {
        var controllers;
        controllers = $.Visualization.controllers();
        controllers.push(new cont($vizContents));
      },
      initControllers: function($visButtons) {
        var cont, mlist, model, _fn, _i, _len, _ref;
        model = $.Model.get();
        mlist = $.ModelListener({
          loadItem: function(data) {
            $.extend(data, {
              mus_url: $.titleToUrl({
                title: data.title,
                vid: data.virtual_id
              })
            });
            if (data.ancestry != null) {
              $.each(data.ancestry, function(index, value) {
                $.extend(value, {
                  mus_url: $.titleToUrl({
                    title: value.title,
                    vid: value.virtual_id
                  })
                });
              });
            }
            console.log("** loadITen - set navigation.");
            console.log(data);
            ($("#navigator #ancestors")).html(Mustache.to_html($.mustacheTemplates.navigator_ancestors, data));
            ($("#navigator #current_section")).html(Mustache.to_html($.mustacheTemplates.navigator_current_section, data));
            if (typeof DISQUS !== "undefined" && DISQUS !== null) {
              DISQUS.reset({
                reload: true,
                config: function() {
                  window.disqus_identifier = this.page.identifier = "disqus" + data.virtual_id;
                  window.disqus_url = this.page.url = "http://obudget2.cloudfoundry.com/index.html#!" + data.virtual_id;
                }
              });
            }
          }
        });
        model.addListener(mlist);
        model.getData(History.getState().data.vid);
        History.Adapter.bind(window, 'statechange', function() {
          console.log("state changed!");
          if (!(History.getState().data.vid != null)) {
            console.log("** no data vid in state");
            return;
          }
          model.getData(History.getState().data.vid);
        });
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
      return _instance != null ? _instance : _instance = new _Singleton_Model(args);
    };

    return Model;

  })();

  _Singleton_Model = (function() {

    function _Singleton_Model(args) {
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
        localStorage.setItem("ob_" + budget.virtual_id, JSON.stringify(budget));
      };
      this.loadLocally = function(slug, callback) {
        var h, s;
        h = ($('head'))[0];
        s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = "." + slug;
        s.addEventListener('load', function(e) {
          callback(window.exports.data);
        }, false);
        window.exports = {};
        h.appendChild(s);
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

    _Singleton_Model.prototype.getData = function(slug) {
      var data, loadLocally, loadResponse;
      if (this.loading) {
        return;
      } else {
        data = JSON.parse(localStorage.getItem("ob_" + slug));
        if (data != null) {
          this.loadResponse(data);
          return;
        }
        loadResponse = this.loadResponse;
        loadLocally = this.loadLocally;
        H.getRecord("/data/" + slug, function(data) {
          if (data != null) {
            loadResponse(data);
          } else {
            loadLocally("/data/" + slug, loadResponse);
          }
        });
        this.loading = true;
      }
    };

    /*
    	add a listener to this model
    */

    _Singleton_Model.prototype.addListener = function(list) {
      this.listeners.push(list);
    };

    return _Singleton_Model;

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

  window.createVirtualItem = function(data) {
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
          virtual_id: value.code,
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
    mustacheTemplates: {
      navigator_ancestors: "{{#ancestry}}<a href='/{{mus_url}}' onclick=\"History.pushState({vid:'{{virtual_id}}', rand:Math.random()}, '{{title}}', $.titleToUrl({title:'/{{title}}',vid:'{{virtual_id}}'})); return false;\">{{title}}</a> > {{/ancestry}}",
      navigator_current_section: '<a href="/{{mus_url}}" onclick="return false">{{title}}</a>'
    }
  });

  $.extend({
    titleToUrl: function(data) {
      return (data.title.replace(" ", "-")) + "?vid=" + data.vid;
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
    TableView: function($container, onSubSection) {
      var that;
      this.container = $container;
      that = this;
      that.onSubSection = onSubSection;
      this.setData = function(data) {
        var table, tableOptions;
        this.container.html('\
			<table cellpadding="0" cellspacing="0" border="0" class="display">\
				<thead>\
					<tr>\
						<th>תקציב</th>\
						<th>שנה</th>\
						<th>מזהה</th>\
					</tr>\
				</thead>\
				<tbody>\
					<tr class="odd gradeX">\
						<td>1234.0</td>\
						<td>1948</td>\
						<td>0020</td>\
					</tr>\
				</tbody>\
			</table>\
			');
        table = null;
        tableOptions = $.extend({}, tableDef);
        if (that.onSubSection != null) {
          $.extend(tableOptions, {
            fnCreatedRow: function(nRow, aData, iDataIndex) {
              return $(nRow).click(function(event) {
                that.onSubSection(aData);
              });
            }
          });
          table = $('table', this.container).dataTable(tableOptions);
        } else {
          table = $('table', this.container).dataTable(tableOptions);
        }
        table.fnClearTable(false);
        return table.fnAddData(data);
      };
      this.container.html('\
		<table cellpadding="0" cellspacing="0" border="0" class="display">\
			<thead>\
				<tr>\
					<th>תקציב</th>\
					<th>שנה</th>\
					<th>מזהה</th>\
				</tr>\
			</thead>\
			<tbody>\
				<tr class="odd gradeX">\
					<td>1234.0</td>\
					<td>1948</td>\
					<td>0020</td>\
				</tr>\
			</tbody>\
		</table>\
		');
      $('table', this.container).dataTable(tableDef);
    }
  });

  tableDef = {};

  tableDef.bDestroy = true;

  tableDef.aoColumns = [
    null, null, {
      "bVisible": false
    }
  ];

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
