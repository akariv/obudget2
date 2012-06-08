#CR: I think that pie and line charts are two unrelated charts, which should not be tied together.
class $.ColumnChartController extends $.Controller
    constructor : ($viz = 'visualization')->
        @id = 'chartViz'
        @createView = (div)->
            new $.ColumnChartView div
        @onSubSection = (subsection) ->
            return

        super $viz
        return
    dataLoaded : (budget) =>
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

        data =
            title : budget.title
            source: budget.author
            categories : categories
            sums : sums

        @getView().setData data

        return
