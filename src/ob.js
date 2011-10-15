(function() {
  window.update_area_chart = function(div_id, data) {
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
        renderTo: div_id,
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
}).call(this);
(function() {
  window.update_pie_chart = function(div_id, year, data) {
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
    return ch = new Highcharts.Chart({
      chart: {
        renderTo: div_id,
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
}).call(this);
(function() {
  var handle_current_item, hash_changed_handler, load_item, set_active_years, set_current_description, set_current_source, set_current_title, set_loading;
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
    _results = [];
    for (_i = 0, _len = years.length; _i < _len; _i++) {
      year = years[_i];
      _results.push($(".year-sel[rel=" + year + "]").toggleClass('disabled', false));
    }
    return _results;
  };
  handle_current_item = function(data) {
    var year, years;
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
    update_area_chart("vis-graph", data);
    return update_pie_chart("vis-pie", 2009, data);
  };
  load_item = function(hash) {
    set_loading(true);
    return H.getRecord("/data/hasadna/budget-ninja/" + hash, handle_current_item);
  };
  hash_changed_handler = function() {
    var hash;
    hash = window.location.hash;
    return load_item(hash.slice(1, (hash.length + 1) || 9e9));
  };
  $(function() {
    $(".vis-button").click(function() {
      var rel;
      rel = $(this).attr("rel");
      $(".vis-content").toggleClass("active", false);
      $(rel).toggleClass("active", true);
      $(".vis-button").toggleClass("active", false);
      return $(this).toggleClass("active", true);
    });
    hash_changed_handler();
    return window.onhashchange = hash_changed_handler;
  });
}).call(this);
