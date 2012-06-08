(function() {
  var str, tableDef, _Singleton_Model,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    _this = this;

  $.Controller = (function() {

    function Controller($vizdiv) {
      var mlist, model, that;
      this.vizDiv = ($("<div id='" + this.id + "'></div>")).appendTo($vizdiv);
      model = $.Model.get();
      that = this;
      mlist = $.ModelListener({
        loadItem: function(data) {
          that.dataLoaded.call(that, data);
        }
      });
      model.addListener(mlist);
      this.getView();
      return;
    }

    Controller.prototype.visible = function(visible) {
      if (visible == null) visible = true;
      return $("#" + this.id).toggleClass("active", visible);
    };

    Controller.prototype.getView = function() {
      if (!(this.view != null)) this.view = this.createView(this.vizDiv);
      return this.view;
    };

    return Controller;

  })();

  $.PieChartController = (function(_super) {

    __extends(PieChartController, _super);

    function PieChartController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'piechartViz';
      this.createView = function(div) {
        return new $.PieChartView(div);
      };
      this.onSubSection = function(subsection) {};
      PieChartController.__super__.constructor.call(this, $viz);
      return;
    }

    PieChartController.prototype.dataLoaded = function(budget) {
      var data, emptyItems, item, latestYearData, otherPart, singleYearMaxLength, sumOtherPart, _i, _len;
      data = [];
      latestYearData = budget.components[budget.components.length - 2];
      emptyItems = [];
      $.each(latestYearData.items, function(index, item) {
        if (item.values.net_allocated != null) {
          data.push([item.title, item.values.net_allocated]);
        } else {
          emptyItems.push(item.title);
        }
      });
      console.log("subsections with no net_allocated value:");
      console.log("****************");
      console.log(emptyItems);
      singleYearMaxLength = 9;
      data.sort(function(a, b) {
        if (a[1] < b[1]) {
          return 1;
        } else {
          return -1;
        }
      });
      if (data.length > singleYearMaxLength) {
        otherPart = data.slice(singleYearMaxLength);
        data = data.slice(0, singleYearMaxLength);
        sumOtherPart = 0;
        for (_i = 0, _len = otherPart.length; _i < _len; _i++) {
          item = otherPart[_i];
          sumOtherPart += item[1];
        }
        data.push([str.piechartOthers, sumOtherPart]);
      }
      this.getView().setData(data);
    };

    return PieChartController;

  })($.Controller);

  $.ColumnChartController = (function(_super) {

    __extends(ColumnChartController, _super);

    function ColumnChartController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'chartViz';
      this.createView = function(div) {
        return new $.ColumnChartView(div);
      };
      this.onSubSection = function(subsection) {};
      ColumnChartController.__super__.constructor.call(this, $viz);
      return;
    }

    ColumnChartController.prototype.dataLoaded = function(budget) {
      var categories, data, sums;
      sums = [];
      categories = [];
      $.each(budget.components, function(index, yearData) {
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
      data = {
        title: budget.title,
        source: budget.author,
        categories: categories,
        sums: sums
      };
      this.getView().setData(data);
    };

    return ColumnChartController;

  })($.Controller);

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
        var qdata, url;
        if (e.keyCode === 13) {
          console.log("** " + searchbox.val());
          url = 'http://api.yeda.us/data/hasadna/budget-ninja/';
          qdata = {
            query: '{\"title\":\"' + searchbox.val() + '\"}',
            o: 'jsonp'
          };
          $.get(url, qdata, function(data) {
            $.each(data, function(index, value) {
              var mus_data;
              mus_data = {
                title: value.title,
                vid: value._src
              };
              $.extend(value, {
                mus_onclick: $.titleToOnClick(mus_data)
              });
            });
            data = {
              searchresults: data
            };
            return searchresults.html(Mustache.to_html($.mustacheTemplates.searchresults, data));
          }, "jsonp");
          e.preventDefault();
        }
      });
    };

    return Search;

  })();

  $.SingleYearTableController = (function(_super) {

    __extends(SingleYearTableController, _super);

    function SingleYearTableController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'tableViz';
      this.createView = function(div) {
        return new $.TableView(div, this.onSubSection);
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
      SingleYearTableController.__super__.constructor.call(this, $viz);
      return;
    }

    SingleYearTableController.prototype.dataLoaded = function(budget) {
      var data, latestYearData;
      data = [];
      latestYearData = budget.components[budget.components.length - 2];
      $.each(latestYearData.items, function(index, item) {
        if (item.values.net_allocated != null) {
          data.push([parseInt(item.values.net_allocated), item.title, item.virtual_id]);
        } else {
          true;
        }
      });
      this.getView().setData(data);
    };

    return SingleYearTableController;

  })($.Controller);

  $.MultiYearTableController = (function(_super) {

    __extends(MultiYearTableController, _super);

    function MultiYearTableController($viz) {
      if ($viz == null) $viz = 'visualization';
      this.dataLoaded = __bind(this.dataLoaded, this);
      this.id = 'tableViz';
      this.createView = function(div) {
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
      MultiYearTableController.__super__.constructor.call(this, $viz);
      return;
    }

    MultiYearTableController.prototype.dataLoaded = function(budget) {
      var data;
      data = [];
      $.each(budget.components, function(index, yearData) {
        var currentYear, yearSum;
        currentYear = yearData.year;
        yearSum = 0;
        $.each(yearData.items, function(index, item) {
          if (item.values.net_allocated != null) {
            yearSum += item.values.net_allocated;
          }
        });
        if (yearSum > 0) data.push([yearSum, currentYear, currentYear]);
      });
      this.getView().setData(data);
    };

    return MultiYearTableController;

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
            var mus_data;
            mus_data = {
              title: data.title,
              vid: data.virtual_id
            };
            $.extend(data, {
              mus_url: $.titleToUrl(mus_data)
            }, {
              mus_onclick: $.titleToOnClick(mus_data)
            });
            if (data.ancestry != null) {
              data.mus_ancestry = data.ancestry.slice(0).reverse();
              $.each(data.mus_ancestry, function(index, value) {
                var mus_value;
                mus_value = {
                  title: value.title,
                  vid: value.virtual_id
                };
                $.extend(value, {
                  mus_url: $.titleToUrl(mus_value)
                }, {
                  mus_onclick: $.titleToOnClick(mus_value)
                });
              });
            }
            console.log("** loadItem - set navigation.");
            console.log(data.ancestry);
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
      		tell everyone the item we''ve loaded
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
        H.getRecord("/" + slug, function(data) {
          if (data != null) {
            loadResponse(data);
          } else {
            loadLocally("/" + slug, loadResponse);
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

  $.extend({
    mustacheTemplates: {
      navigator_ancestors: "{{#mus_ancestry}}<a href='/{{mus_url}}' onclick='{{mus_onclick}}'}>{{title}}</a> > {{/mus_ancestry}}",
      navigator_current_section: '<a href="/{{mus_url}}" onclick="return false">{{title}}</a>',
      searchresults: '{{#searchresults}}<a href="/{{title}}" onclick="{{mus_onclick}}">{{title}}</a> <br> {{/searchresults}}'
    }
  });

  $.extend({
    titleToUrl: function(data) {
      var newtitle;
      newtitle = (data.title.replace(/\ /g, "-")) + "?vid=" + data.vid;
      console.log("replaced " + data.title + " with " + newtitle);
      return newtitle;
    },
    titleToOnClick: function(data) {
      return "History.pushState({vid:'" + data.vid + "',rand:Math.random()}, '" + data.title + "', '" + $.titleToUrl(data) + "'); return false;";
    }
  });

  str = {
    piechartOthers: 'סעיפים אחרים'
  };

  $.extend({
    ColumnChartView: function($container) {
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
          type: 'column'
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
                        <th>מספרים</th>\
                        <th>מילים</th>\
                        <th>מזהה</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr class="odd gradeX">\
                        <td>1234.0</td>\
                        <td>תיאור כלשהו</td>\
                        <td>0020</td>\
                    </tr>\
                </tbody>\
            </table>\
            ');
        table = null;
        tableOptions = $.extend({}, tableDef);
        if ($(this.container).hasClass('multiYear')) {
          tableOptions.aaSorting = [[1, "desc"]];
        } else {
          tableOptions.aaSorting = [[0, "desc"]];
        }
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

  $.extend({
    OB: {
      initControllers: function() {
        $.Visualization.addController($.SingleYearTableController, $("#vis-contents"));
        $.Visualization.addController($.MultiYearTableController, $("#vis-contents"));
        $.Visualization.addController($.ColumnChartController, $("#vis-contents"));
        $.Visualization.addController($.PieChartController, $("#vis-contents"));
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

}).call(this);
