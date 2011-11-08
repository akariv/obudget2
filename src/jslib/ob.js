(function() {
  var HcAreaChart, HcPieChart, ItemInfo, OBudget, SearchUI, Visualization, build_results_popup, mouse_is_inside, search_focus, search_key_pressed, set_active_year, set_active_years, set_current_description, set_current_source, set_current_title, set_loading;
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
  build_results_popup = function() {
    $('#result-container').append('<div id="row_1" class="result-row"></div>');
    $('#row_1').append('<div id="results" class="result-cell"></div>');
    $('#row_1').append('<div class="result-cell"><h1>הכי נצפים בשבוע האחרון</h1></div>');
    $('#result-container').append('<div id="row_2" class="result-row"></div>');
    $('#row_2').append('<div class="result-cell"><h1>תגובות רלוונטיות</h1></div>');
    $('#row_2').append('<div class="result-cell"><h1>הכי מדוברים בשבוע האחרון</h1></div>');
    return $("#results").html("<h1>תוצאות חיפוש</h1>");
  };
  mouse_is_inside = false;
  search_key_pressed = false;
  search_focus = false;
  SearchUI = (function() {
    function SearchUI() {
      this.handle_search_results = __bind(this.handle_search_results, this);
      this.append_table_row = __bind(this.append_table_row, this);
      this.load_search = __bind(this.load_search, this);
    }
    SearchUI.prototype.load_search = function() {
      build_results_popup();
      $('#result-container').hover(this.hoverStart, this.hoverEnd);
      $("body").mouseup(this.mouseUpCbk);
      $("#search").append("<input id='search-box' type='text'></input>");
      $("#search").append("<a><span class='button' id='search-button'>חפש</span></a>");
      $("#search-button").mouseup(function(e) {
        $('#search-button').removeClass('button-pressed');
        $('#search-button').addClass('button');
        return search_key_pressed = false;
      });
      $("#search-button").mousedown(function(e) {
        search_key_pressed = true;
        $('#search-button').removeClass('button');
        $('#search-button').addClass('button-pressed');
        return window.ob.search_db($("#search-box").val());
      });
      $("#search-box").keypress(function(e) {
        var code, evt;
        evt = window.event || e;
        code = evt.keyCode ? evt.keyCode : evt.which;
        if (code === 13) {
          if (!evt.target) {
            evt.target = evt.srcElement;
          }
          return window.ob.search_db(evt.target.value);
        }
      });
      $("#search-box").blur(function(e) {
        var evt;
        evt = window.event || e;
        if (!evt.target) {
          evt.target = evt.srcElement;
        }
        search_focus = false;
        evt.target.value = "";
        return $.Watermark.ShowAll();
      });
      $("#search-box").focus(function(e) {
        var evt;
        evt = window.event || e;
        if (!evt.target) {
          evt.target = evt.srcElement;
        }
        search_focus = true;
        evt.target.value = "";
        return $.Watermark.HideAll();
      });
      return $("#search-box").Watermark("חיפוש");
    };
    SearchUI.prototype.append_table_row = function(record) {
      var flat_title, hash, max_year, min_year, value, year, year_list, _ref;
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
      $("#res_scroller").append("<a class='result-cell' id=" + hash + " href='obudget.html#" + hash + "'></a><br/>");
      flat_title = record.title.replace(/\n/g, '');
      flat_title = flat_title.replace(/\r/g, '');
      return $("#" + hash).append("<span class='result-cell'>" + flat_title + " , " + max_year + " - " + min_year + "</span>");
    };
    SearchUI.prototype.handle_search_results = function(data) {
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
    SearchUI.prototype.hoverStart = function() {
      return mouse_is_inside = true;
    };
    SearchUI.prototype.hoverEnd = function() {
      return mouse_is_inside = false;
    };
    SearchUI.prototype.mouseUpCbk = function() {
      if (mouse_is_inside === false && search_key_pressed === false) {
        return $('#result-container').hide();
      }
    };
    SearchUI.prototype.hideResultPopup = function() {
      return $('#result-container').hide();
    };
    return SearchUI;
  })();
  set_active_year = function(year) {
    $(".year-sel").toggleClass('active', false);
    return $(".year-sel[rel=" + year + "]").toggleClass('active', true);
  };
  OBudget = (function() {
    function OBudget() {
      this.handle_current_item = __bind(this.handle_current_item, this);
      this.hash_changed_handler = __bind(this.hash_changed_handler, this);
      var year_sel_click;
      this.visualizations = {};
      this.visualization_names = [];
      this.selected_visualization = null;
      this.year = 2010;
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
      this.search_path = "/data/hasadna/budget-ninja/";
    }
    OBudget.prototype.load_item = function(hash) {
      set_loading(true);
      return H.getRecord("/data/hasadna/budget-ninja/" + hash, this.handle_current_item);
    };
    OBudget.prototype.hash_changed_handler = function() {
      var hash;
      $('#result-container').hide();
      hash = window.location.hash;
      return this.load_item(hash.slice(1, (hash.length + 1) || 9e9));
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
    OBudget.prototype.search_db = function(string) {
      $("#results").html("<h1>תוצאות חיפוש</h1>");
      $("#results").append("<div class='loader' id='res_scroller'></div>");
      $("#res_scroller").append("<img class='loader' src='images/ajax-loader.gif'/>");
      $("#result-container").show();
      return H.findRecords(this.search_path, window.searchUI.handle_search_results, {
        "title": {
          "$regex": string
        }
      }, null, 1, 100);
    };
    return OBudget;
  })();
  $(function() {
    window.searchUI = new SearchUI;
    window.searchUI.load_search();
    window.ob = new OBudget;
    window.ob.load_visualizations(new HcAreaChart, new HcPieChart, new ItemInfo);
    return window.ob.hash_changed_handler();
  });
}).call(this);
