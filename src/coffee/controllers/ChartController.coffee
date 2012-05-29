#CR: I think that pie and line charts are two unrelated charts, which should not be tied together.
class $.ChartController extends $.Controller
    constructor : ($viz = 'visualization')->
        @id = 'chartViz'
        @createSingleYearView = (div)->
            new $.PieChartView div
        @createMultiYearView = (div)->
            new $.LineChartView div
        @onSubSection = (subsection) ->
            return

        super $viz
        return
    dataLoaded : (budget) =>
        singleYearData = []
        # Latest year
        latestYearData = budget.components[budget.components.length - 2]

        # Take the net allocated value and display in the table
        emptyItems = []
        $.each latestYearData.items, (index, item) ->
            if item.values.net_allocated?
                singleYearData.push [item.title, item.values.net_allocated]
            else
                emptyItems.push item.title
            return

        console.log "subsections with no net_allocated value:"
        console.log "****************"
        console.log emptyItems

        singleYearMaxLength = 9 # elemets after singleYearMaxLength will be lumped to 'other'
        # sort the array from large value to small
        singleYearData.sort (a,b) ->
            return if a[1] < b[1] then 1 else -1

        if singleYearData.length > singleYearMaxLength
            otherPart = singleYearData[singleYearMaxLength..] # elements to be lumped
            singleYearData = singleYearData[...singleYearMaxLength] # elements not lumped
            sumOtherPart = 0 
            for item in otherPart # sum the 'others' value
                sumOtherPart += item[1]
            singleYearData.push ['סעיפים אחרים', sumOtherPart] # add an 'others' slice to the chart

        @getSingleYearView().setData singleYearData

        # Create the multiYear data
        sums = []
        categories = []
        $.each budget.components, (index, yearData) ->
            currentYear = yearData.year
            yearSum = 0
            $.each yearData.items, (index, item) ->
                if item.values.net_allocated?
                    yearSum += item.values.net_allocated
                return
            if yearSum > 0
                sums.push yearSum
                categories.push currentYear
            return

        mutliYearData =
            title : budget.title
            source: budget.author
            categories : categories
            sums : sums

        @getMultiYearView().setData mutliYearData

        return
