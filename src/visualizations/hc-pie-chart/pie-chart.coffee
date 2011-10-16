class HcPieChart extends Visualization
    
    constructor: ->
        super("HcPieChart","images/pie_chart256.png")

    initialize: (div_id) ->
        super(div_id)
        $("#"+div_id).css("direction","ltr")
                            
    update: (data,year) -> 
        refs = []
        for ref in data.refs
           if ref.year == year
               if ref.gross_revised
                    refs[refs.length] = 
                        name:
                             ref.title
                        y:
                             ref.gross_revised
    
        ch = new Highcharts.Chart
                chart:
                   renderTo: @div_id
                   plotBackgroundColor: null
                   plotBorderWidth: null
                   plotShadow: false
                title:
                    text: 'Browser market shares at a specific website, 2010'
                tooltip:
                    formatter: -> "<b>#{@point.name}</b>: #{@point.y}%"
                plotOptions:
                    pie:
                        allowPointSelect: true
                        cursor: 'pointer'
                        dataLabels:
                            enabled: true
                            color: '#000000'
                            connectorColor: '#000000'
                            formatter: -> @point.name
                series: [
                          {  
                            type: 'pie',
                            name: 'Browser share',
                            data: refs
                          }
                        ]
    
    isYearDependent: -> true

    