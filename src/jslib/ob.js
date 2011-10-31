(function() {
  var HcAreaChart, HcPieChart, ItemInfo, OBudget, Visualization, set_active_year, set_active_years, set_current_description, set_current_source, set_current_title, set_loading;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Visualization = (function() {
    function Visualization(name, iconurl) {
      this.name = name;
      this.iconurl = iconurl;
      this.data = null;
      this.year = null;
    }
    Visualization.prototype.getIconUrl = function() {
      return this.iconurl;
    };
    Visualization.prototype.getName = function() {
      return this.name;
    };
    Visualization.prototype.setData = function(data) {
      this.data = data;
      if (!this.initialized) {
        alert("" + this.name + " not initialized???");
        return;
      }
      return this.update(this.data, this.year);
    };
    Visualization.prototype.setYear = function(year) {
      if (this.isYearDependent()) {
        return this.year = year;
      }
    };
    Visualization.prototype.initialize = function(div_id) {
      this.div_id = div_id;
      return this.initialized = true;
    };
    Visualization.prototype.update = function() {
      return alert("you should implement 'update' in visualization " + this.name);
    };
    Visualization.prototype.isYearDependent = function() {
      return alert("you should implement 'isYearDependent' in visualization " + this.name);
    };
    Visualization.prototype.isVisualization = function() {
      return true;
    };
    return Visualization;
  })();
  HcAreaChart = (function() {
    __extends(HcAreaChart, Visualization);
    function HcAreaChart() {
      HcAreaChart.__super__.constructor.call(this, "HcAreaChart", "images/area_chart256.png");
    }
    HcAreaChart.prototype.initialize = function(div_id) {
      HcAreaChart.__super__.initialize.call(this, div_id);
      return $("#" + div_id).css("direction", "ltr");
    };
    HcAreaChart.prototype.update = function(data, year) {
      var categories, ch, s, series, year;
      categories = (function() {
        var _results;
        _results = [];
        for (year in data.sums) {
          _results.push(year);
        }
        return _results;
      })();
      series = [
        {
          name: 'תקציב מתוכנן - נטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].net_allocated) != null ? _ref : null);
            }
            return _results;
          })()
        }, {
          name: 'תקציב מתוכנן - ברוטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].gross_allocated) != null ? _ref : null);
            }
            return _results;
          })()
        }, {
          name: 'תקציב מעודכן - נטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].net_revised) != null ? _ref : null);
            }
            return _results;
          })()
        }, {
          name: 'תקציב מעודכן - ברוטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].gross_revised) != null ? _ref : null);
            }
            return _results;
          })()
        }, {
          name: 'ביצוע תקציב - נטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].net_used) != null ? _ref : null);
            }
            return _results;
          })()
        }, {
          name: 'ביצוע תקציב - ברוטו',
          data: (function() {
            var _i, _len, _ref, _results;
            _results = [];
            for (_i = 0, _len = categories.length; _i < _len; _i++) {
              year = categories[_i];
              _results.push((_ref = data.sums[year].gross_used) != null ? _ref : null);
            }
            return _results;
          })()
        }
      ];
      ch = new Highcharts.Chart({
        chart: {
          renderTo: this.div_id,
          defaultSeriesType: 'column',
          spacingBottom: 30
        },
        title: {
          text: 'לאורך השנים'
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 100,
          y: 10,
          floating: true,
          borderWidth: 1,
          backgroundColor: '#FFFFFF'
        },
        xAxis: {
          categories: categories,
          title: {
            text: "שנה"
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'אלפי ש"ח'
          },
          labels: {
            formatter: function() {
              return this.value;
            }
          }
        },
        tooltip: {
          formatter: function() {
            return "" + this.y + " ש\"ח";
          }
        },
        plotOptions: {
          area: {
            fillOpacity: 0.5
          }
        },
        credits: {
          enabled: false
        },
        series: series
      });
      s = ch.series;
      s[0].hide();
      s[1].hide();
      s[2].hide();
      s[3].show();
      s[4].hide();
      return s[5].show();
    };
    HcAreaChart.prototype.isYearDependent = function() {
      return false;
    };
    return HcAreaChart;
  })();
  HcPieChart = (function() {
    __extends(HcPieChart, Visualization);
    function HcPieChart() {
      HcPieChart.__super__.constructor.call(this, "HcPieChart", "images/pie_chart256.png");
    }
    HcPieChart.prototype.initialize = function(div_id) {
      HcPieChart.__super__.initialize.call(this, div_id);
      return $("#" + div_id).css("direction", "ltr");
    };
    HcPieChart.prototype.update = function(data, year) {
      var ch, ref, refs, _i, _len, _ref;
      refs = [];
      _ref = data.refs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ref = _ref[_i];
        if (ref.year === year) {
          if (ref.gross_revised) {
            refs[refs.length] = {
              name: ref.title,
              y: ref.gross_revised
            };
          }
        }
      }
      refs = refs.sort(function(a, b) {
        return b.y - a.y;
      });
      return ch = new Highcharts.Chart({
        chart: {
          renderTo: this.div_id,
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Browser market shares at a specific website, 2010'
        },
        tooltip: {
          formatter: function() {
            return "<b>" + this.point.name + "</b>: " + this.point.y + "%";
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              formatter: function() {
                return this.point.name;
              }
            }
          }
        },
        series: [
          {
            type: 'pie',
            name: 'Browser share',
            data: refs
          }
        ]
      });
    };
    HcPieChart.prototype.isYearDependent = function() {
      return true;
    };
    return HcPieChart;
  })();
  ItemInfo = (function() {
    __extends(ItemInfo, Visualization);
    function ItemInfo() {
      ItemInfo.__super__.constructor.call(this, "ItemInfo", "images/numbers256.png");
    }
    ItemInfo.prototype.initialize = function(div_id) {
      return ItemInfo.__super__.initialize.call(this, div_id);
    };
    ItemInfo.prototype.update = function(data, year) {
      var code, content, item_years, key, keys, padding, ref, s, table, title, year, years, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
      years = (function() {
        var _results;
        _results = [];
        for (year in data.sums) {
          _results.push(year);
        }
        return _results;
      })();
      table = {};
      keys = [];
      _ref = data.refs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ref = _ref[_i];
        if (!ref.title) {
          continue;
        }
        padding = "00000000000000".slice(0, (14 - ref.code.length + 1) || 9e9);
        key = "" + padding + "|||" + ref.code + "|||" + ref.title;
        if (!table[key]) {
          table[key] = {};
          keys[keys.length] = key;
        }
        table[key][ref.year] = ref;
      }
      content = ["<td></td><td>" + years.join("</td><td>") + "</td>"];
      keys = keys.sort();
      for (_j = 0, _len2 = keys.length; _j < _len2; _j++) {
        key = keys[_j];
        item_years = table[key];
        _ref2 = key.split("|||", 3), padding = _ref2[0], code = _ref2[1], title = _ref2[2];
        s = ["" + code + "/" + title];
        for (_k = 0, _len3 = years.length; _k < _len3; _k++) {
          year = years[_k];
          ref = item_years[year];
          s[s.length] = (_ref3 = ref != null ? ref.gross_revised : void 0) != null ? _ref3 : '';
        }
        content[content.length] = "<td>" + s.join("</td><td>") + "</td>";
      }
      content = "<tr>" + content.join("</tr><tr>") + "</tr>";
      return $("#" + this.div_id).html("<table class='iteminfo'>" + content + "</table>");
    };
    ItemInfo.prototype.isYearDependent = function() {
      return false;
    };
    return ItemInfo;
  })();
  set_loading = function(is_loading) {};
  set_current_description = function(description) {
    return $("#current-description").html("" + description);
  };
  set_current_source = function(source) {
    return $("#current-source").html("" + source);
  };
  set_current_title = function(title) {
    return $("#current-title").html("" + title);
  };
  set_active_years = function(years) {
    var year, _i, _len, _results;
    $(".year-sel").toggleClass('disabled', true);
    $(".year-sel").toggleClass('enabled', false);
    _results = [];
    for (_i = 0, _len = years.length; _i < _len; _i++) {
      year = years[_i];
      $(".year-sel[rel=" + year + "]").toggleClass('disabled', false);
      _results.push($(".year-sel[rel=" + year + "]").toggleClass('enabled', true));
    }
    return _results;
  };
  set_active_year = function(year) {
    $(".year-sel").toggleClass('active', false);
    return $(".year-sel[rel=" + year + "]").toggleClass('active', true);
  };
  OBudget = (function() {
    function OBudget() {
      this.load_search = __bind(this.load_search, this);
      this.handle_search_results = __bind(this.handle_search_results, this);
      this.append_table_row = __bind(this.append_table_row, this);
      this.handle_current_item = __bind(this.handle_current_item, this);
      var year_sel_click;
      this.visualizations = {};
      this.visualization_names = [];
      this.selected_visualization = null;
      this.year = 2010;
      this.mouse_is_inside = false;
      this.search_focus = false;
      window.onhashchange = this.hash_changed_handler;
      year_sel_click = function(obj) {
        return function() {
          var year;
          if ($(this).hasClass('enabled')) {
            year = $(this).attr('rel');
            return obj.select_year(parseInt(year));
          }
        };
      };
      $(".year-sel").click(year_sel_click(this));
    }
    OBudget.prototype.load_item = function(hash) {
      set_loading(true);
      return this.handle_current_item({
        "title": "\u05de\u05e9\u05e8\u05d3 \u05d4\u05d7\u05d9\u05e0\u05d5\u05da",
        "timestamp": "Thu Oct  6 10:47:30 2011",
        "notes": "\u05e1\u05e2\u05d9\u05e3 \u05d6\u05d4 \u05e0\u05d2\u05d6\u05e8 \u05d1\u05e6\u05d5\u05e8\u05d4 \u05d0\u05d5\u05d8\u05d5\u05de\u05d8\u05d9\u05ea \u05de\u05e0\u05ea\u05d5\u05e0\u05d9 \u05de\u05e9\u05e8\u05d3 \u05d4\u05d0\u05d5\u05e6\u05e8",
        "sums": {
          "2007": {
            "net_allocated": 25877676,
            "net_used": 27106375,
            "gross_revised": 27395584,
            "gross_used": 28461190,
            "net_revised": 25877676
          },
          "2008": {
            "net_allocated": 27551845,
            "net_used": 28621630,
            "gross_revised": 29064263,
            "gross_used": 30070454,
            "net_revised": 27551845
          },
          "2009": {
            "net_allocated": 30311997,
            "net_used": 30040733,
            "gross_revised": 31862549,
            "gross_used": 31453232,
            "net_revised": 30311997
          },
          "2011": {
            "net_allocated": 34901335,
            "net_revised": 34901335,
            "gross_revised": 36496721,
            "gross_allocated": 36496721,
            "gross_used": 21616172
          },
          "2010": {
            "net_allocated": 32418924,
            "net_revised": 32418924,
            "gross_revised": 33982982,
            "gross_allocated": 33982982,
            "gross_used": 34690091
          },
          "2012": {
            "net_revised": 36278439,
            "gross_revised": 37873515,
            "gross_used": 0
          }
        },
        "_src": "data/hasadna/budget-ninja/0020_eef9f8e320e4e7e9f0e5ea",
        "source": "\u05de\u05e9\u05e8\u05d3 \u05d4\u05d0\u05d5\u05e6\u05e8",
        "parts": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        "refs": [
          {
            "net_allocated": 1258833,
            "code": "002021",
            "gross_allocated": 1283329,
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 1283329,
            "gross_used": 138607,
            "_src": "data/gov/mof/budget/2011_002021",
            "net_revised": 1258833,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002021"
          }, {
            "net_allocated": 8159789,
            "code": "002026",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 8388406,
            "gross_used": 9100876,
            "_src": "data/gov/mof/budget/2007_002026",
            "net_revised": 8159789,
            "year": 2007,
            "net_used": 8919847,
            "_srcslug": "data__gov__mof__budget__2007_002026"
          }, {
            "code": "002026",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 13277353,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002026",
            "net_revised": 13011473,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002026"
          }, {
            "code": "002038",
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 1043686,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002038",
            "net_revised": 1042186,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002038"
          }, {
            "net_allocated": 2178958,
            "code": "002028",
            "gross_allocated": 2326705,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2326705,
            "gross_used": 2344250,
            "_src": "data/gov/mof/budget/2010_002028",
            "net_revised": 2178958,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002028"
          }, {
            "net_allocated": 88365,
            "code": "002033",
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 119535,
            "gross_used": 109263,
            "_src": "data/gov/mof/budget/2008_002033",
            "net_revised": 88365,
            "year": 2008,
            "net_used": 96951,
            "_srcslug": "data__gov__mof__budget__2008_002033"
          }, {
            "net_allocated": 583764,
            "code": "002022",
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 586143,
            "gross_used": 614823,
            "_src": "data/gov/mof/budget/2008_002022",
            "net_revised": 583764,
            "year": 2008,
            "net_used": 612729,
            "_srcslug": "data__gov__mof__budget__2008_002022"
          }, {
            "net_allocated": 1194465,
            "code": "002024",
            "gross_allocated": 1207405,
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 1207405,
            "gross_used": 631111,
            "_src": "data/gov/mof/budget/2011_002024",
            "net_revised": 1194465,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002024"
          }, {
            "net_allocated": 958375,
            "code": "002030",
            "gross_allocated": 962876,
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 962876,
            "gross_used": 621574,
            "_src": "data/gov/mof/budget/2011_002030",
            "net_revised": 958375,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002030"
          }, {
            "net_allocated": 1160377,
            "code": "002021",
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 1179208,
            "gross_used": 214002,
            "_src": "data/gov/mof/budget/2007_002021",
            "net_revised": 1160377,
            "year": 2007,
            "net_used": 197771,
            "_srcslug": "data__gov__mof__budget__2007_002021"
          }, {
            "code": "002023",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1859378,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002023",
            "net_revised": 1859318,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002023"
          }, {
            "net_allocated": 582023,
            "code": "002022",
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 585152,
            "gross_used": 672126,
            "_src": "data/gov/mof/budget/2009_002022",
            "net_revised": 582023,
            "year": 2009,
            "net_used": 670461,
            "_srcslug": "data__gov__mof__budget__2009_002022"
          }, {
            "net_allocated": 2641764,
            "code": "002025",
            "gross_allocated": 3399888,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3399888,
            "gross_used": 3406623,
            "_src": "data/gov/mof/budget/2010_002025",
            "net_revised": 2641764,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002025"
          }, {
            "net_allocated": 2050772,
            "code": "002028",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2211711,
            "gross_used": 2202263,
            "_src": "data/gov/mof/budget/2008_002028",
            "net_revised": 2050772,
            "year": 2008,
            "net_used": 2048321,
            "_srcslug": "data__gov__mof__budget__2008_002028"
          }, {
            "net_allocated": 7177022,
            "code": "002027",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 7500631,
            "gross_used": 7762389,
            "_src": "data/gov/mof/budget/2008_002027",
            "net_revised": 7177022,
            "year": 2008,
            "net_used": 7438470,
            "_srcslug": "data__gov__mof__budget__2008_002027"
          }, {
            "net_allocated": 58271,
            "code": "002031",
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 58294,
            "gross_used": 85701,
            "_src": "data/gov/mof/budget/2007_002031",
            "net_revised": 58271,
            "year": 2007,
            "net_used": 85696,
            "_srcslug": "data__gov__mof__budget__2007_002031"
          }, {
            "code": "002031",
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 34215,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002031",
            "net_revised": 34212,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002031"
          }, {
            "net_allocated": 1279844,
            "code": "002021",
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 1305675,
            "gross_used": 227768,
            "_src": "data/gov/mof/budget/2009_002021",
            "net_revised": 1279844,
            "year": 2009,
            "net_used": 214794,
            "_srcslug": "data__gov__mof__budget__2009_002021"
          }, {
            "net_allocated": 306039,
            "code": "002038",
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 307539,
            "gross_used": 844616,
            "_src": "data/gov/mof/budget/2008_002038",
            "net_revised": 306039,
            "year": 2008,
            "net_used": 843446,
            "_srcslug": "data__gov__mof__budget__2008_002038"
          }, {
            "net_allocated": 595412,
            "code": "002022",
            "gross_allocated": 598541,
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 598541,
            "gross_used": 717509,
            "_src": "data/gov/mof/budget/2010_002022",
            "net_revised": 595412,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002022"
          }, {
            "code": "0020999999",
            "title": "\u05d7\u05e9\u05d1\u05d5\u05df \u05de\u05e2\u05d1\u05e8",
            "gross_revised": 0,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2009_0020999999",
            "year": 2009,
            "_srcslug": "data__gov__mof__budget__2009_0020999999"
          }, {
            "code": "00209999",
            "gross_revised": 0,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2009_00209999",
            "year": 2009,
            "_srcslug": "data__gov__mof__budget__2009_00209999"
          }, {
            "code": "002099",
            "title": "\u05d7\u05e9\u05d1\u05d5\u05df \u05de\u05e2\u05d1\u05e8",
            "gross_revised": 0,
            "_src": "data/gov/mof/budget/2007_002099",
            "year": 2007,
            "net_used": 1,
            "_srcslug": "data__gov__mof__budget__2007_002099"
          }, {
            "net_allocated": 1910,
            "code": "002032",
            "gross_allocated": 1910,
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 1910,
            "gross_used": 1731,
            "_src": "data/gov/mof/budget/2010_002032",
            "net_revised": 1910,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002032"
          }, {
            "net_allocated": 940451,
            "code": "002030",
            "gross_allocated": 943059,
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 943059,
            "gross_used": 1225202,
            "_src": "data/gov/mof/budget/2010_002030",
            "net_revised": 940451,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002030"
          }, {
            "net_allocated": 2381579,
            "code": "002025",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3008413,
            "gross_used": 3047812,
            "_src": "data/gov/mof/budget/2007_002025",
            "net_revised": 2381579,
            "year": 2007,
            "net_used": 2382685,
            "_srcslug": "data__gov__mof__budget__2007_002025"
          }, {
            "code": "002027",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 9170496,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002027",
            "net_revised": 8845372,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002027"
          }, {
            "net_allocated": 854010,
            "code": "002038",
            "gross_allocated": 855510,
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 855510,
            "gross_used": 1159517,
            "_src": "data/gov/mof/budget/2010_002038",
            "net_revised": 854010,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002038"
          }, {
            "net_allocated": 1551859,
            "code": "002029",
            "gross_allocated": 1554059,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1554059,
            "gross_used": 1856208,
            "_src": "data/gov/mof/budget/2010_002029",
            "net_revised": 1551859,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002029"
          }, {
            "net_allocated": 2589,
            "code": "002032",
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 2589,
            "gross_used": 2194,
            "_src": "data/gov/mof/budget/2008_002032",
            "net_revised": 2589,
            "year": 2008,
            "net_used": 2194,
            "_srcslug": "data__gov__mof__budget__2008_002032"
          }, {
            "net_allocated": 1706550,
            "code": "002023",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1707957,
            "gross_used": 1959396,
            "_src": "data/gov/mof/budget/2008_002023",
            "net_revised": 1706550,
            "year": 2008,
            "net_used": 1959379,
            "_srcslug": "data__gov__mof__budget__2008_002023"
          }, {
            "net_allocated": 12135309,
            "code": "002026",
            "gross_allocated": 12401189,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 12401189,
            "gross_used": 7518277,
            "_src": "data/gov/mof/budget/2011_002026",
            "net_revised": 12135309,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002026"
          }, {
            "net_allocated": 8269132,
            "code": "002027",
            "gross_allocated": 8592741,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 8592741,
            "gross_used": 8410275,
            "_src": "data/gov/mof/budget/2010_002027",
            "net_revised": 8269132,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002027"
          }, {
            "net_allocated": 1863749,
            "code": "002023",
            "gross_allocated": 1863809,
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1863809,
            "gross_used": 952347,
            "_src": "data/gov/mof/budget/2011_002023",
            "net_revised": 1863749,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002023"
          }, {
            "net_allocated": 427006,
            "code": "002038",
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 428506,
            "gross_used": 808029,
            "_src": "data/gov/mof/budget/2007_002038",
            "net_revised": 427006,
            "year": 2007,
            "net_used": 806232,
            "_srcslug": "data__gov__mof__budget__2007_002038"
          }, {
            "net_allocated": 595795,
            "code": "002030",
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 598403,
            "gross_used": 684882,
            "_src": "data/gov/mof/budget/2009_002030",
            "net_revised": 595795,
            "year": 2009,
            "net_used": 682864,
            "_srcslug": "data__gov__mof__budget__2009_002030"
          }, {
            "net_allocated": 1383641,
            "code": "002029",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1385841,
            "gross_used": 1513259,
            "_src": "data/gov/mof/budget/2008_002029",
            "net_revised": 1383641,
            "year": 2008,
            "net_used": 1512526,
            "_srcslug": "data__gov__mof__budget__2008_002029"
          }, {
            "net_allocated": 46991,
            "code": "002031",
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 47014,
            "gross_used": 90437,
            "_src": "data/gov/mof/budget/2008_002031",
            "net_revised": 46991,
            "year": 2008,
            "net_used": 90434,
            "_srcslug": "data__gov__mof__budget__2008_002031"
          }, {
            "net_allocated": 917073,
            "code": "002024",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 949678,
            "gross_used": 1022574,
            "_src": "data/gov/mof/budget/2008_002024",
            "net_revised": 917073,
            "year": 2008,
            "net_used": 1016956,
            "_srcslug": "data__gov__mof__budget__2008_002024"
          }, {
            "net_allocated": 3160,
            "code": "002032",
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 3160,
            "gross_used": 2378,
            "_src": "data/gov/mof/budget/2007_002032",
            "net_revised": 3160,
            "year": 2007,
            "net_used": 2378,
            "_srcslug": "data__gov__mof__budget__2007_002032"
          }, {
            "code": "002030",
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 952349,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002030",
            "net_revised": 947848,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002030"
          }, {
            "net_allocated": 1600526,
            "code": "002023",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1601933,
            "gross_used": 1876342,
            "_src": "data/gov/mof/budget/2007_002023",
            "net_revised": 1600526,
            "year": 2007,
            "net_used": 1876321,
            "_srcslug": "data__gov__mof__budget__2007_002023"
          }, {
            "code": "002032",
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 1800,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002032",
            "net_revised": 1800,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002032"
          }, {
            "net_allocated": 1781251,
            "code": "002023",
            "gross_allocated": 1782613,
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1782613,
            "gross_used": 2005780,
            "_src": "data/gov/mof/budget/2010_002023",
            "net_revised": 1781251,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002023"
          }, {
            "code": "002029",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1736577,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002029",
            "net_revised": 1734377,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002029"
          }, {
            "net_allocated": 0,
            "code": "002099",
            "gross_allocated": 0,
            "title": "\u05d7\u05e9\u05d1\u05d5\u05df \u05de\u05e2\u05d1\u05e8",
            "_src": "data/gov/mof/budget/2011_002099",
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002099"
          }, {
            "net_allocated": 11175484,
            "code": "002026",
            "gross_allocated": 11434464,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 11434464,
            "gross_used": 11894020,
            "_src": "data/gov/mof/budget/2010_002026",
            "net_revised": 11175484,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002026"
          }, {
            "net_allocated": 1733606,
            "code": "002029",
            "gross_allocated": 1735806,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1735806,
            "gross_used": 1079453,
            "_src": "data/gov/mof/budget/2011_002029",
            "net_revised": 1733606,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002029"
          }, {
            "net_allocated": 1074758,
            "code": "002038",
            "gross_allocated": 1076258,
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 1076258,
            "gross_used": 630024,
            "_src": "data/gov/mof/budget/2011_002038",
            "net_revised": 1074758,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002038"
          }, {
            "net_allocated": 36713,
            "code": "002031",
            "gross_allocated": 36716,
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 36716,
            "gross_used": 93365,
            "_src": "data/gov/mof/budget/2010_002031",
            "net_revised": 36713,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002031"
          }, {
            "net_allocated": 918972,
            "code": "002024",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 928237,
            "gross_used": 1048617,
            "_src": "data/gov/mof/budget/2009_002024",
            "net_revised": 918972,
            "year": 2009,
            "net_used": 1043728,
            "_srcslug": "data__gov__mof__budget__2009_002024"
          }, {
            "net_allocated": 81998,
            "code": "002033",
            "gross_allocated": 111698,
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 111698,
            "gross_used": 71633,
            "_src": "data/gov/mof/budget/2011_002033",
            "net_revised": 81998,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002033"
          }, {
            "net_allocated": 1001181,
            "code": "002024",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 1033741,
            "gross_used": 1118658,
            "_src": "data/gov/mof/budget/2007_002024",
            "net_revised": 1001181,
            "year": 2007,
            "net_used": 1107809,
            "_srcslug": "data__gov__mof__budget__2007_002024"
          }, {
            "net_allocated": 1847,
            "code": "002032",
            "gross_allocated": 1847,
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 1847,
            "gross_used": 131,
            "_src": "data/gov/mof/budget/2011_002032",
            "net_revised": 1847,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002032"
          }, {
            "code": "002099",
            "gross_revised": 0,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2009_002099",
            "year": 2009,
            "_srcslug": "data__gov__mof__budget__2009_002099"
          }, {
            "net_allocated": 7335714,
            "code": "002027",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 7659323,
            "gross_used": 8017213,
            "_src": "data/gov/mof/budget/2009_002027",
            "net_revised": 7335714,
            "year": 2009,
            "net_used": 7710090,
            "_srcslug": "data__gov__mof__budget__2009_002027"
          }, {
            "net_allocated": 1237243,
            "code": "002029",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1239443,
            "gross_used": 1469021,
            "_src": "data/gov/mof/budget/2007_002029",
            "net_revised": 1237243,
            "year": 2007,
            "net_used": 1469982,
            "_srcslug": "data__gov__mof__budget__2007_002029"
          }, {
            "net_allocated": 1446045,
            "code": "002029",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9 \u05d5\u05de\u05d5\u05db\u05e8",
            "gross_revised": 1448245,
            "gross_used": 1602536,
            "_src": "data/gov/mof/budget/2009_002029",
            "net_revised": 1446045,
            "year": 2009,
            "net_used": 1602379,
            "_srcslug": "data__gov__mof__budget__2009_002029"
          }, {
            "code": "002033",
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 110641,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002033",
            "net_revised": 80941,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002033"
          }, {
            "net_allocated": 647881,
            "code": "002022",
            "gross_allocated": 649686,
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 649686,
            "gross_used": 368637,
            "_src": "data/gov/mof/budget/2011_002022",
            "net_revised": 647881,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002022"
          }, {
            "net_allocated": 6710316,
            "code": "002027",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 7075325,
            "gross_used": 7258050,
            "_src": "data/gov/mof/budget/2007_002027",
            "net_revised": 6710316,
            "year": 2007,
            "net_used": 6942111,
            "_srcslug": "data__gov__mof__budget__2007_002027"
          }, {
            "net_allocated": 82427,
            "code": "002033",
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 112127,
            "gross_used": 111366,
            "_src": "data/gov/mof/budget/2009_002033",
            "net_revised": 82427,
            "year": 2009,
            "net_used": 98547,
            "_srcslug": "data__gov__mof__budget__2009_002033"
          }, {
            "code": "002021",
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 1747576,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002021",
            "net_revised": 1723080,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002021"
          }, {
            "net_allocated": 0,
            "code": "002099",
            "gross_allocated": 0,
            "title": "\u05d7\u05e9\u05d1\u05d5\u05df \u05de\u05e2\u05d1\u05e8",
            "_src": "data/gov/mof/budget/2010_002099",
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002099"
          }, {
            "net_allocated": 39877,
            "code": "002031",
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 39880,
            "gross_used": 54387,
            "_src": "data/gov/mof/budget/2009_002031",
            "net_revised": 39877,
            "year": 2009,
            "net_used": 54386,
            "_srcslug": "data__gov__mof__budget__2009_002031"
          }, {
            "net_allocated": 594334,
            "code": "002030",
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 596942,
            "gross_used": 580932,
            "_src": "data/gov/mof/budget/2008_002030",
            "net_revised": 594334,
            "year": 2008,
            "net_used": 578153,
            "_srcslug": "data__gov__mof__budget__2008_002030"
          }, {
            "net_allocated": 2445665,
            "code": "002025",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3145722,
            "gross_used": 3378810,
            "_src": "data/gov/mof/budget/2008_002025",
            "net_revised": 2445665,
            "year": 2008,
            "net_used": 2678802,
            "_srcslug": "data__gov__mof__budget__2008_002025"
          }, {
            "net_allocated": 2581261,
            "code": "002025",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3326879,
            "gross_used": 3629120,
            "_src": "data/gov/mof/budget/2009_002025",
            "net_revised": 2581261,
            "year": 2009,
            "net_used": 2914906,
            "_srcslug": "data__gov__mof__budget__2009_002025"
          }, {
            "code": "002024",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 1202228,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002024",
            "net_revised": 1189288,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002024"
          }, {
            "net_allocated": 62057,
            "code": "002033",
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 93227,
            "gross_used": 192640,
            "_src": "data/gov/mof/budget/2007_002033",
            "net_revised": 62057,
            "year": 2007,
            "net_used": 179864,
            "_srcslug": "data__gov__mof__budget__2007_002033"
          }, {
            "net_allocated": 2791987,
            "code": "002025",
            "gross_allocated": 3572217,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3572217,
            "gross_used": 2366900,
            "_src": "data/gov/mof/budget/2011_002025",
            "net_revised": 2791987,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002025"
          }, {
            "net_allocated": 568183,
            "code": "002022",
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 570562,
            "gross_used": 609207,
            "_src": "data/gov/mof/budget/2007_002022",
            "net_revised": 568183,
            "year": 2007,
            "net_used": 607528,
            "_srcslug": "data__gov__mof__budget__2007_002022"
          }, {
            "code": "002022",
            "title": "\u05d0\u05de\u05e8\u05db\u05dc\u05d5\u05ea \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9 \u05de\u05e9\u05e8\u05d3",
            "gross_revised": 647337,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002022",
            "net_revised": 645467,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002022"
          }, {
            "net_allocated": 1730098,
            "code": "002023",
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05de\u05d5\u05e8\u05d9\u05dd",
            "gross_revised": 1731460,
            "gross_used": 2057266,
            "_src": "data/gov/mof/budget/2009_002023",
            "net_revised": 1730098,
            "year": 2009,
            "net_used": 2057247,
            "_srcslug": "data__gov__mof__budget__2009_002023"
          }, {
            "net_allocated": 2059,
            "code": "002032",
            "title": "\u05e8\u05e9\u05d5\u05ea \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 2059,
            "gross_used": 1965,
            "_src": "data/gov/mof/budget/2009_002032",
            "net_revised": 2059,
            "year": 2009,
            "net_used": 1965,
            "_srcslug": "data__gov__mof__budget__2009_002032"
          }, {
            "code": "002099",
            "title": "\u05d7\u05e9\u05d1\u05d5\u05df \u05de\u05e2\u05d1\u05e8",
            "gross_revised": -4528,
            "_src": "data/gov/mof/budget/2008_002099",
            "year": 2008,
            "net_used": -4528,
            "_srcslug": "data__gov__mof__budget__2008_002099"
          }, {
            "code": "002037",
            "title": "\u05de\u05e0\u05d4\u05dc \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 0,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2008_002037",
            "net_revised": 0,
            "year": 2008,
            "_srcslug": "data__gov__mof__budget__2008_002037"
          }, {
            "net_allocated": 9282012,
            "code": "002026",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 9510602,
            "gross_used": 9763099,
            "_src": "data/gov/mof/budget/2008_002026",
            "net_revised": 9282012,
            "year": 2008,
            "net_used": 9531767,
            "_srcslug": "data__gov__mof__budget__2008_002026"
          }, {
            "net_allocated": 608849,
            "code": "002030",
            "title": "\u05d4\u05e1\u05e2\u05d5\u05ea \u05d4\u05e6\u05d8\u05d9\u05d9\u05d3\u05d5\u05ea \u05d5\u05e4\u05d9\u05ea\u05d5\u05d7",
            "gross_revised": 611457,
            "gross_used": 602379,
            "_src": "data/gov/mof/budget/2007_002030",
            "net_revised": 608849,
            "year": 2007,
            "net_used": 601349,
            "_srcslug": "data__gov__mof__budget__2007_002030"
          }, {
            "net_allocated": 2335316,
            "code": "002028",
            "gross_allocated": 2482263,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2482263,
            "gross_used": 1460282,
            "_src": "data/gov/mof/budget/2011_002028",
            "net_revised": 2335316,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002028"
          }, {
            "net_allocated": 918102,
            "code": "002024",
            "gross_allocated": 927367,
            "title": "\u05de\u05d9\u05e0\u05d4\u05dc \u05e4\u05d3\u05d2\u05d5\u05d2\u05d9-\u05db\u05dc\u05dc\u05d9",
            "gross_revised": 927367,
            "gross_used": 1188275,
            "_src": "data/gov/mof/budget/2010_002024",
            "net_revised": 918102,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002024"
          }, {
            "net_allocated": 866459,
            "code": "002038",
            "title": "\u05d4\u05e2\u05d1\u05e8\u05d5\u05ea \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05d9\u05dd",
            "gross_revised": 867959,
            "gross_used": 1109721,
            "_src": "data/gov/mof/budget/2009_002038",
            "net_revised": 866459,
            "year": 2009,
            "net_used": 1108366,
            "_srcslug": "data__gov__mof__budget__2009_002038"
          }, {
            "net_allocated": 10742313,
            "code": "002026",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 11001293,
            "gross_used": 10008841,
            "_src": "data/gov/mof/budget/2009_002026",
            "net_revised": 10742313,
            "year": 2009,
            "net_used": 9803348,
            "_srcslug": "data__gov__mof__budget__2009_002026"
          }, {
            "net_allocated": 1392125,
            "code": "002021",
            "gross_allocated": 1417956,
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 1417956,
            "gross_used": 279064,
            "_src": "data/gov/mof/budget/2010_002021",
            "net_revised": 1392125,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002021"
          }, {
            "net_allocated": 35220,
            "code": "002031",
            "gross_allocated": 35223,
            "title": "\u05ea\u05e8\u05d1\u05d5\u05ea",
            "gross_revised": 35223,
            "gross_used": 24183,
            "_src": "data/gov/mof/budget/2011_002031",
            "net_revised": 35220,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002031"
          }, {
            "code": "002025",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e7\u05d3\u05dd \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 3580688,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002025",
            "net_revised": 2800833,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002025"
          }, {
            "net_allocated": 1899139,
            "code": "002028",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2103909,
            "gross_used": 2076093,
            "_src": "data/gov/mof/budget/2007_002028",
            "net_revised": 1899139,
            "year": 2007,
            "net_used": 1926801,
            "_srcslug": "data__gov__mof__budget__2007_002028"
          }, {
            "net_allocated": 2109110,
            "code": "002028",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2255857,
            "gross_used": 2227424,
            "_src": "data/gov/mof/budget/2009_002028",
            "net_revised": 2109110,
            "year": 2009,
            "net_used": 2077652,
            "_srcslug": "data__gov__mof__budget__2009_002028"
          }, {
            "code": "002028",
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05d4\u05ea\u05d9\u05e9\u05d1\u05d5\u05ea\u05d9",
            "gross_revised": 2509191,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2012_002028",
            "net_revised": 2362244,
            "year": 2012,
            "_srcslug": "data__gov__mof__budget__2012_002028"
          }, {
            "net_allocated": 81753,
            "code": "002033",
            "gross_allocated": 111453,
            "title": "\u05d8\u05dc\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d7\u05d9\u05e0\u05d5\u05db\u05d9\u05ea",
            "gross_revised": 111453,
            "gross_used": 108274,
            "_src": "data/gov/mof/budget/2010_002033",
            "net_revised": 81753,
            "year": 2010,
            "_srcslug": "data__gov__mof__budget__2010_002033"
          }, {
            "net_allocated": 8787991,
            "code": "002027",
            "gross_allocated": 9113115,
            "title": "\u05d7\u05d9\u05e0\u05d5\u05da \u05e2\u05dc \u05d9\u05e1\u05d5\u05d3\u05d9",
            "gross_revised": 9113115,
            "gross_used": 5751417,
            "_src": "data/gov/mof/budget/2011_002027",
            "net_revised": 8787991,
            "year": 2011,
            "_srcslug": "data__gov__mof__budget__2011_002027"
          }, {
            "net_allocated": 967028,
            "code": "002021",
            "title": "\u05d9\u05d7\u05d9\u05d3\u05d5\u05ea \u05de\u05d8\u05d4",
            "gross_revised": 992359,
            "gross_used": 230927,
            "_src": "data/gov/mof/budget/2008_002021",
            "net_revised": 967028,
            "year": 2008,
            "net_used": 216030,
            "_srcslug": "data__gov__mof__budget__2008_002021"
          }, {
            "code": "002037",
            "title": "\u05de\u05e0\u05d4\u05dc \u05d4\u05e1\u05e4\u05d5\u05e8\u05d8",
            "gross_revised": 0,
            "gross_used": 0,
            "_src": "data/gov/mof/budget/2007_002037",
            "net_revised": 0,
            "year": 2007,
            "_srcslug": "data__gov__mof__budget__2007_002037"
          }
        ],
        "_srcslug": "data__hasadna__budget-ninja__0020_eef9f8e320e4e7e9f0e5ea"
      });
    };
    OBudget.prototype.hash_changed_handler = function() {
      var hash;
      $('#result-container').hide();
      hash = window.location.hash;
      return window.ob.load_item(hash.slice(1, (hash.length + 1) || 9e9));
    };
    OBudget.prototype.handle_current_item = function(data) {
      var year, years;
      this.loaded_data = $.extend({}, data);
      set_loading(false);
      set_current_title(data.title);
      set_current_source(data.source);
      set_current_description(data.notes);
      years = (function() {
        var _results;
        _results = [];
        for (year in data.sums) {
          _results.push(year);
        }
        return _results;
      })();
      set_active_years(years);
      return this.select_visualization();
    };
    OBudget.prototype.select_year = function(year) {
      var v;
      v = this.visualizations[this.selected_visualization];
      v.setYear(year);
      set_active_year(year);
      return v.setData(this.loaded_data);
    };
    OBudget.prototype.select_visualization = function(name) {
      var v, _ref;
      if (!name) {
        name = (_ref = this.selected_visualization) != null ? _ref : this.visualization_names[0];
      }
      this.selected_visualization = name;
      v = this.visualizations[name];
      $(".vis-content").toggleClass("active", false);
      $("#vis-" + name).toggleClass("active", true);
      $(".vis-button").toggleClass("active", false);
      $("#vis-" + name + "-button").toggleClass("active", true);
      $("#year-selection").toggleClass("disabled", !v.isYearDependent());
      $("#year-selection").toggleClass("enabled", v.isYearDependent());
      v.setYear(this.year);
      return v.setData(this.loaded_data);
    };
    OBudget.prototype.load_visualizations = function() {
      var iconurl, name, v, visualizations, x, _i, _len, _results;
      visualizations = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = visualizations.length; _i < _len; _i++) {
        v = visualizations[_i];
        name = v.getName();
        this.visualizations[name] = v;
        this.visualization_names[this.visualization_names.length] = name;
        $("#vis-contents").append("<div class='vis-content' id='vis-" + name + "'>" + name + "</div>");
        $("#vis-buttons").append("<span class='vis-button' id='vis-" + name + "-button'></span>");
        iconurl = v.getIconUrl();
        $("#vis-" + name + "-button").css("background-image", "url(" + iconurl + ")");
        x = __bind(function(name) {
          return __bind(function() {
            return this.select_visualization(name);
          }, this);
        }, this);
        $("#vis-" + name + "-button").click(x(name));
        _results.push(v.initialize("vis-" + name));
      }
      return _results;
    };
    OBudget.prototype.append_table_row = function(record) {
      var hash, max_year, min_year, value, year, year_list, _ref;
      year_list = [];
      _ref = record.sums;
      for (year in _ref) {
        if (!__hasProp.call(_ref, year)) continue;
        value = _ref[year];
        year_list.push(parseInt(year));
      }
      min_year = Math.min.apply(null, year_list);
      max_year = Math.max.apply(null, year_list);
      hash = record._src.split("/")[3];
      $("#res_scroller").append("<a id=" + hash + " href='obudget.html#" + hash + "'></a>");
      $("#" + hash).append("<span class='result-cell'>" + record.title + "</span>");
      return $("#" + hash).append("<span class='result-cell'>" + max_year + " - " + min_year + "</span>");
    };
    OBudget.prototype.handle_search_results = function(data) {
      var record, _i, _len, _results;
      $("#res_scroller").html("");
      $("#res_scroller").removeClass("loader");
      $("#res_scroller").addClass("scroll");
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        record = data[_i];
        _results.push(this.append_table_row(record));
      }
      return _results;
    };
    OBudget.prototype.hoverStart = function() {
      return this.mouse_is_inside = true;
    };
    OBudget.prototype.hoverEnd = function() {
      return this.mouse_is_inside = false;
    };
    OBudget.prototype.mouseUpCbk = function() {
      if (this.mouse_is_inside === false) {
        $('#result-container').hide();
        if (this.search_focus) {
          $("#search-box").val("");
          return $.Watermark.ShowAll();
        }
      }
    };
    OBudget.prototype.search_db = function(string) {
      $("#results").html("<h1>תוצאות חיפוש</h1>");
      $("#results").append("<div class='loader' id='res_scroller'></div>");
      $("#res_scroller").append("<img class='loader' src='images/ajax-loader.gif'/>");
      $("#result-container").show();
      return H.findRecords(this.search_path, this.handle_search_results, {
        "title": {
          "$regex": string
        }
      }, null, 1, 100);
    };
    OBudget.prototype.load_search = function() {
      this.search_path = "/data/hasadna/budget-ninja/";
      $('#result-container').append('<div id="row_1" class="result-row"></div>');
      $('#row_1').append('<div id="results" class="result-cell"></div>');
      $('#row_1').append('<div class="result-cell">הכי נצפים בשבוע האחרון</div>');
      $('#result-container').append('<div id="row_2" class="result-row"></div>');
      $('#row_2').append('<div class="result-cell">תגובות רלוונטיות</div>');
      $('#row_2').append('<div class="result-cell">הכי מדוברים בשבוע האחרון</div>');
      $('#result-container').hover(this.hoverStart, this.hoverEnd);
      $("body").mouseup(this.mouseUpCbk);
      $("#search").append("<input id='search-box' type='text'></input>");
      return $("#search").change(function(e) {
        var evt;
        evt = window.event || e;
        if (!evt.target) {
          evt.target = evt.srcElement;
        }
        return window.ob.search_db(evt.target.value);
      });
    };
    return OBudget;
  })();
  $("#search").blur(function(e) {
    var evt;
    evt = window.event || e;
    if (!evt.target) {
      evt.target = evt.srcElement;
    }
    window.ob.search_focus = false;
    evt.target.value = "";
    return $.Watermark.ShowAll();
  });
  $("#search").blur(function(e) {
    var evt;
    evt = window.event || e;
    if (!evt.target) {
      evt.target = evt.srcElement;
    }
    window.ob.search_focus = true;
    evt.target.value = "";
    return $.Watermark.HideAll();
  });
  $("#search-box").Watermark("חיפוש");
  $("#results").html("<h1>תוצאות חיפוש</h1>");
  $(function() {
    window.ob = new OBudget;
    window.ob.load_visualizations(new HcAreaChart, new HcPieChart, new ItemInfo);
    window.ob.hash_changed_handler();
    return window.ob.load_search();
  });
}).call(this);
