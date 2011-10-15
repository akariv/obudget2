window.update_area_chart = (div_id,data) ->
    categories = (year for year of data.sums)
    series = [ { name: 'תקציב מתוכנן - נטו',   data: ( data.sums[year].net_allocated ? null for year in categories ) }
               { name: 'תקציב מתוכנן - ברוטו',  data: ( data.sums[year].gross_allocated ? null for year in categories ) } 
               { name: 'תקציב מעודכן - נטו',   data: ( data.sums[year].net_revised ? null for year in categories ) } 
               { name: 'תקציב מעודכן - ברוטו',  data: ( data.sums[year].gross_revised ? null for year in categories ) } 
               { name: 'ביצוע תקציב - נטו',    data: ( data.sums[year].net_used ? null for year in categories ) } 
               { name: 'ביצוע תקציב - ברוטו',  data: ( data.sums[year].gross_used ? null for year in categories ) } 
               ]
    ch = new Highcharts.Chart
        chart:
            renderTo: div_id
            defaultSeriesType: 'column'
            spacingBottom: 30
        title:
            text: 'לאורך השנים'
        legend:
            layout: 'vertical'
            align: 'left'
            verticalAlign: 'top'
            x: 100
            y: 10
            floating: true
            borderWidth: 1
            backgroundColor: '#FFFFFF'
        xAxis:
            categories: 
                categories
            title:
                text: "שנה"
        yAxis:
            min: 
                0
            title:
                text: 'אלפי ש"ח'
            labels:
                formatter: -> @value
        tooltip:
            formatter: -> "#{@y} ש\"ח"
        plotOptions:
            area:
                fillOpacity: 0.5
        credits:
            enabled: false
        series: series
    
    s=ch.series
    s[0].hide()
    s[1].hide()
    s[2].hide()
    s[3].show()
    s[4].hide()
    s[5].show()
    