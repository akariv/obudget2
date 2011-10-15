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
