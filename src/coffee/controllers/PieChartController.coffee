class $.PieChartController extends $.Controller
    constructor : ($viz = 'visualization')->
        @id = 'piechartViz'
        @createView = (div)->
            new $.PieChartView div
        @onSubSection = (subsection) ->
            return

        super $viz
        return
    dataLoaded : (budget) =>
        data = []
        # Latest year
        latestYearData = budget.components[budget.components.length - 2]

        # Take the net allocated value and display in the table
        emptyItems = []
        $.each latestYearData.items, (index, item) ->
            if item.values.net_allocated?
                data.push [item.title, item.values.net_allocated]
            else
                emptyItems.push item.title
            return

        console.log "subsections with no net_allocated value:"
        console.log "****************"
        console.log emptyItems

        singleYearMaxLength = 9 # elemets after singleYearMaxLength will be lumped to 'other'
        # sort the array from large value to small
        data.sort (a,b) ->
            return if a[1] < b[1] then 1 else -1

        if data.length > singleYearMaxLength
            otherPart = data[singleYearMaxLength..] # elements to be lumped
            data = data[...singleYearMaxLength] # elements not lumped
            sumOtherPart = 0
            for item in otherPart # sum the 'others' value
                sumOtherPart += item[1]
            data.push [str.piechartOthers, sumOtherPart] # add an 'others' slice to the chart

        @getView().setData data
        return
