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
