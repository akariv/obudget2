L = (x...) -> console.log x...

globalHandleError = -> alert "error"

###################################
#################### Budget Items #
###################################

selectedItems = null

class ItemModel extends Backbone.Model
        defaults:
                id: null
        urlRoot: '/api'
        initialize: ->
                @on 'change:y', @setYearstr
                @on 'change:expl', @setExplanations
                @on 'change:t', @setTitle
                @on 'change:c', @setCode

                if (@get 'expl') then @setExplanations()
                if (@get 't') then @setTitle()
                if (@get 'y') then @setYearstr()
                if (@get 'c') then @setCode()

        fixText: (t) ->
                t = t.replace(/\n/g,"<br/>")
                t = t.replace(/\"/g, "&quot;")
                t = t.replace(/\(/g, "XXXXXXX")
                t = t.replace(/\)/g, "(")
                t = t.replace(/XXXXXXX/g, ")")
                if t.length > 1000
                        t = t[0..1000]+"..."
                return t

        setExplanations: ->
                # Fix some text problems in the explanations string:
                expl = @get 'expl'
                @set 'explanations', @fixText(expl)

        setTitle: ->
                # Fix some text problems in the title string:
                title = @get 't'
                @set 'title', @fixText(title)

        setYearstr: ->
                # Build a string describing year ranges for which there's data
                years = @get 'y'
                if not years then return
                years = Object.keys(years)
                years.sort()

                yearstr = null
                firstyear=null
                lastyear=null
                @addition = (firstyear,lastyear) ->
                        if firstyear == lastyear
                                "#{firstyear}"
                        else
                                "#{firstyear}&#8209;#{lastyear}"
                @update_yearstr = (firstyear,lastyear) ->
                        if yearstr == null
                                yearstr = @addition(firstyear,lastyear)
                        else
                                yearstr += ", #{@addition(firstyear,lastyear)}"
                years.push null
                for year in years
                        year = parseInt(year)
                        if firstyear==null
                                firstyear = lastyear = year
                        else if year == (lastyear+1)
                                lastyear = year
                        else
                                @update_yearstr(firstyear,lastyear)
                                firstyear = lastyear = year
                @set 'yearstr', yearstr

        setCode: ->
                @set 'code', (@get 'c').substring(2)

        isSelected: ->
                (selectedItems.where id:@get 'id').length > 0


class ItemCollection extends Backbone.Collection
        model: ItemModel
        comparator: (item) ->
                code = item.attributes.c
                if not item.attributes.y
                        years = []
                else
                        years = Object.keys(item.attributes.y)
                if years.length > 0
                        year = years[0]
                else
                        year = 0
                "#{code}/#{year}"

class SelectedItemsCollection extends ItemCollection
        initialize: (@options) ->
                L "SelectedItemsCollection::initialize"
                @on 'add remove reset', @updateData
        setReportModel: (@reportModel) ->
                @reportModel.on "change:use_real_values", @updateData
                @reportModel.on "change:normalization_series", @updateData
                @reportModel.on 'change:fromyear', @updateData
                @reportModel.on 'change:toyear', @updateData

        updateData: =>
                L "SelectedItemsCollection::updateData"
                data = {}

                skip_inflation = false
                normalization_series = @reportModel.get 'normalization_series'
                normalization_title = ""
                if normalization_series
                        normalization_series_values = normalization_series.get 'y'
                units = @reportModel.getUnits()
                if normalization_series
                        numerator = normalization_series.get 'numerator'
                        denominator = normalization_series.get 'denominator'
                        normalization_title = " יחסית ל#{normalization_series.get 'title'}"
                        if numerator == 'ש"ח נומינלי'
                                skip_inflation = true
                                if denominator
                                        units = denominator
                                else
                                        units = 'יחס'
                        else
                                if denominator
                                        units ="#{@reportModel.getUnits()}*#{denominator} ל#{numerator}"
                                else
                                        units ="#{@reportModel.getUnits()} ל#{numerator}"

                for model in @models
                        years = model.get 'y'
                        title = model.get 't'
                        code = model.get 'c'
                        key = "#{code}__#{title}"
                        for year,budget of years
                                _budget = _.clone(budget)
                                year=parseInt(year)
                                if (year < @reportModel.get 'fromyear') or (year > @reportModel.get 'toyear')
                                        continue
                                if (@reportModel.get 'use_real_values') and (not skip_inflation)
                                        inflation = (inflationExtraData.get 'y')[year].value
                                        for k,v of _budget
                                                if $.type v =="number"
                                                        _budget[k] = v/inflation
                                if normalization_series and normalization_series_values
                                        if not normalization_series_values[year]?.value
                                                continue
                                        normalize = normalization_series_values[year].value
                                        for k,v of _budget
                                                if $.type v =="number"
                                                        _budget[k] = v/normalize
                                if not data[year]
                                        data[year] = { "year": year }
                                data[year][key] = _budget
                @data = []
                for k,v of data
                        @data.push(v)
                @trigger 'dataUpdated', @data, units, normalization_title

#############################
#################### Report #
#############################
class ReportModel extends Backbone.Model
        defaults:
                ids: []
                compare_id: null
                normalize_id: null
                use_real_values: true
                extra_details: false
                fromyear: 1992
                toyear: 2012
        initialize: ->
                @on 'change:compare_id', @fetchExtraData
                @on 'change:normalize_id', @fetchExtraData
        fetchAll: (selectedItems) ->
                @fetchItems(selectedItems)
                @fetchExtraData()
        fetchItems: (selectedItems) ->
                for id in @get 'ids'
                        L "loading #{id} from report", selectedItems.models
                        item = new ItemModel id:id
                        item.fetch
                                success: (model,response,options) ->
                                        L "loaded #{id} from report"
                                        selectedItems.add(model)
                                error: globalHandleError
        fetchExtraData: ->
                fetch_id = @get 'compare_id'
                if fetch_id
                        data_series = new DataSeriesModel id:fetch_id
                        data_series.fetch
                                success: (model,response,options) =>
                                        L "loaded series #{model.get 'id'} as comparison_series"
                                        @set 'comparison_series', model
                                error: globalHandleError
                else
                        @set 'comparison_series', null
                fetch_id = @get 'normalize_id'
                if fetch_id
                        data_series = new DataSeriesModel id:fetch_id
                        data_series.fetch
                                success: (model,response,options) =>
                                        L "loaded series #{model.get 'id'} as normalization_series"
                                        @set 'normalization_series', model
                                error: globalHandleError
                else
                        @set 'normalization_series', null
        getUnits: ->
                if @get 'use_real_values' then 'ש"ח ריאלי' else 'ש"ח נומינלי'


class AllReportsCollection extends Backbone.Collection
        model: ReportModel
        url: "/api/all"
        initialize: ->
                L "loading all reports"
                @fetch()

class AllReportsView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @model.bind 'add remove reset', @render
                @render()
        render: ->
                $(@el).html ""
                for item in @model.models
                        template = _.template $("#all-reports-list-template").html(), item
                        $(@el).append template


class ReportDetailsView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @model.bind 'change', @render
                @render()

        render: ->
                L "ReportDetailsView::render title = #{@model.get 'title'}"
                @$("#report-title").html @model.get 'title'
                @$("#report-description").html @model.get 'description'
                @$("#report-author").html @model.get 'author'
                @$("#report-author-link").attr 'href', @model.get 'author-link'

class ReportDetailsForm extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @model.bind 'change', @render
                @render()

        render: ->
                L "ReportDetailsForm::render title = #{@model.get 'title'}"
                @$("#report-form-title").val @model.get 'title'
                @$("#report-form-description").val @model.get 'description'
                @$("#report-form-author").val @model.get 'author'
                @$("#report-form-author-link").val @model.get 'author-link'

        events:
                'change #report-form-title':       -> @model.set 'title',       @$("#report-form-title").val()
                'change #report-form-description': -> @model.set 'description', @$("#report-form-description").val()
                'change #report-form-author':      -> @model.set 'author',      @$("#report-form-author").val()
                'change #report-form-author-link': -> @model.set 'author-link', @$("#report-form-author-link").val()

class SelectedItemsView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @model.bind 'add remove reset', @render
                @render()

        render: ->
                $(@el).html ""
                for item in @model.models
                        template = _.template $("#selected-items-list-template").html(), item
                        $(@el).append template
                $("[data-toggle='popover']").popover({})

class EditableSelectedItemsView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.bind 'reset add remove', @render
                @render()

        render: ->
                L "EditableSelectedItemsView::RENDER"
                @$(".selected-item-editable").remove()
                L "EditableSelectedItemsView::RENDER 2 "
                for item in @model.models
                        L "EditableSelectedItemsView::RENDER 3", item
                        template = _.template $("#selected-item-editable-template").html(), item
                        @$("#selected-items-list-editable").append template
                        L "EditableSelectedItemsView::RENDER 4"

        events:
                'click #clear-selection': ->
                        @model.reset()
                'click .selected-item-editable': (e) ->
                        id = $(e.currentTarget).attr('data-id')
                        @model.remove(@model.get(id))

############################
#################### Roots #
############################
class RootsModel extends Backbone.Model
        defaults:
                roots: null
        initialize: ->
                L "RootsModel::initialize"
                @on 'change:roots', @rootsUpdated
                @url = "/api/roots"
                @fetch()

        rootsUpdated: ->
                L "RootsModel::rootsUpdated"
                for id in @get 'roots'
                        L "loading #{id} from roots"
                        item = new ItemModel id:id
                        item.fetch
                                success: (model,response,options) ->
                                        L "loaded #{model.get 'id'} from roots"
                                        rootsCollection.add(model)
                                error: globalHandleError


class RootsCollection extends Backbone.Collection
        model: ItemModel
        comparator: (item) ->
                item.get 'c'

rootsCollection = new RootsCollection

class RootsTabbedView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.bind 'add remove', @render
                @render()

        render: ->
                L "RootsTabbedView::render"
                @$(".root-tab").remove()
                for item in @model.models
                        template = _.template $("#roots-tab-template").html(), item
                        $(@el).append(template)
                        #@$("#editor-search-bar").before template
                @$(".root-tab a").click( (e) =>
                        @$(".root-tab").toggleClass('active',false)
                        @$(e.currentTarget).parent().toggleClass('active',true)
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else model = null
                        searchTermModel.set 'origin', model
                )
                @$(".root-tab:first a").click()

####################################
#################### SearchResults #
####################################
class SearchTermModel extends Backbone.Model
        defaults:
                term: ""
                origin: ""
                fromyear: 1992
                toyear:2012
        initialize: ->
                @on "change:term", -> L "term = ",(@get 'term')
                @on "change:origin", -> L "origin = ",(@get 'origin')

searchTermModel = new SearchTermModel

class SearchResultsCollection extends ItemCollection
        model: ItemModel
        initialize: ->
                searchTermModel.on 'change:term', @doSearch
                searchTermModel.on 'change:origin', @doSearch
        doSearch: =>
                origin = searchTermModel.get 'origin'
                origin = origin.get 'id'
                L "SearchResultsCollection::doSearch #{origin} '#{searchTermModel.get 'term'}'"
                @url = "/api/S#{origin}__#{searchTermModel.get 'term'}"
                @fetch
                        success: => L "SearchResultsCollection::doSearch: loaded #{@.models.length} items"
                        error: -> window.alert "error"
        filteredModels: =>
                fromyear = searchTermModel.get 'fromyear'
                toyear = searchTermModel.get 'toyear'
                _.filter( @models
                         ,
                          (m) ->
                                years = _.map( _.keys(m.get 'y'), (year) -> parseInt(year) )
                                _.reduce( years
                                         ,
                                          (memo, year) ->
                                                memo or ((year <= toyear) and (year >= fromyear))
                                         ,
                                          false )
                        )



searchResultsCollection = new SearchResultsCollection

class SearchResultsView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.on 'add remove reset', @render
                searchTermModel.on 'change:fromyear', @render
                searchTermModel.on 'change:toyear', @render
                @selectedItemsModel = @options.selectedItemsModel
                @selectedItemsModel.on 'add remove reset', @render
                @render()
                L "SearchResultsView::initialize"

        render: ->
                @$(".budget-item").remove()
                for item in @model.filteredModels()
                        template = _.template $("#search-result-template").html(), item
                        $(@el).append template
                @setupEvents(@$("tr"))
                @$("[data-toggle='popover']").popover({})

        setupEvents: (el) ->
                L "SearchResultsView::setupEvents", el.size()
                $("a",el).click (e) =>
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else model = null
                        searchTermModel.set 'origin', model
                        false
                $(".selection-widget",el).click (e) =>
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else return
                        if model.isSelected()
                                L "SearchResultsView::render:: removing ",model
                                selectedItems.remove(model)
                        else
                                L "SearchResultsView::render:: adding ",model
                                selectedItems.add(model)
                        template = _.template $("#search-result-template").html(), model
                        @$(e.currentTarget).parent().replaceWith template
                        @setupEvents(@$("tr[data-id=#{model.get 'id'}]"))


class SearchBarView extends Backbone.View
        events:
                "keyup input": ->
                        searchTermModel.set 'term', @$("input").val()

##################################
#################### BreadCrumbs #
##################################
class BreadCrumbs extends ItemCollection
        model: ItemModel
        comparator: (model) -> (model.get 'c').length
        initialize: ->
                searchTermModel.on 'change:origin', @originChanged
        originChanged: =>
                L "BreadCrumbs::originChanged"
                origin = searchTermModel.get 'origin'
                filtered = @filter (x) ->
                        origin_code = origin.get 'c'
                        item_code = x.get 'c'
                        (origin_code.indexOf(item_code) == 0) and (origin_code.length != item_code.length)
                filtered.push origin
                @update filtered

class BreadCrumbsView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.on 'add remove reset', @render
                @render()
        render: ->
                L "BreadCrumbsView::render"
                if @model.models.length == 0 then return
                @$("li").remove()
                for item in @model.initial()
                        template = _.template $("#breadcrumb-template").html(), item
                        $(@el).append template
                template = _.template $("#breadcrumb-last-template").html(), @model.last()
                $(@el).append template

                @$("a").click (e) =>
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else model = null
                        searchTermModel.set 'origin', model

################################
#################### ExtraData #
################################
class DataSeriesModel extends Backbone.Model
        defaults:
                y: {}
                title: ""
        urlRoot: "/api/"

inflationExtraData = new DataSeriesModel id:"Cinflation"
inflationExtraData.fetch()

class DataSeriesCollection extends Backbone.Collection
        model: DataSeriesModel
        url: "/api/series"
        initialize: ->
                L "DataSeriesCollection:initialize"
                @fetch()

dataSeriesCollection = new DataSeriesCollection

class DataSeriesView extends Backbone.View
        initialize: ->
                _.bindAll @
                dataSeriesCollection.on 'add remove reset', @render
                @model.on 'change', @render
                @render()
        render: ->
                L "DataSeriesView::render"
                if dataSeriesCollection.models.length == 0 then return
                @$("select .series-option").remove()
                for item in dataSeriesCollection.models
                        template = _.template $("#comparison-series-template").html(), item
                        @$("select").append template
                @$("#use-real-values").attr('checked',if @model.get 'use_real_values' then "checked" else null)
                @$("#normalization-series").val(@model.get 'normalize_id')
                @$("#comparison-series").val(@model.get 'compare_id')
        events:
                "change #normalization-series": (e) -> @model.set 'normalize_id',    if $(e.currentTarget).val() == "none" then null else $(e.currentTarget).val()
                "change #comparison-series":    (e) -> @model.set 'compare_id',      if $(e.currentTarget).val() == "none" then null else $(e.currentTarget).val()
                "change #use-real-values":      (e) -> @model.set 'use_real_values', ($(e.currentTarget).attr("checked") == "checked")

############################
#################### Graph #
############################

class BudgetDataPoints
        constructor: (@view,@yscale) ->
        draw: (values,scale) ->
                @svg = @view.svg
                @svg.selectAll("circle.main-graph")
                    .data(values)
                    .enter()
                    .append("circle")
                    .attr("cx",(d) => @view.x(d.year))
                    .attr("cy",(d) => @yscale(d.value/scale))
                    .attr("r",10)
                    .style("fill","white")
                    .style("stroke","steelblue")
                    .style("cursor","pointer")
                    .attr("class", "main-graph")
                    .on("click",(d,i) => @view.openDetail(d,@view.x(d.year),@yscale(d.value/scale),d3.event))

class MainGraph
        constructor: (@view,@lefty,@title,@subtitle,@units,@dataPointClass,@yscale,@scale) ->
                @xAxis = d3.svg.axis()
                            .scale(@view.x)
                            .orient("bottom")
                            .tickFormat(d3.format("d"))
                @yAxis = d3.svg.axis()
                            .scale(@yscale)
                            .orient("left")
                            .tickFormat(d3.format(".2f"))

        draw: (values) ->
                @svg = @view.svg

                @line = d3.svg.line()
                            .x( (d) => @view.x(parseInt(d.year)) )
                            .y( (d) => @yscale(d.value/@scale) )

                daClass = if @lefty then "left" else "right"

                stroke = if @lefty then "steelblue" else "lightsalmon"

                @svg.append("path")
                        .datum(values)
                        .attr("class", "line")
                        .attr("d", (d) => @line(d))
                        .style("fill","none")
                                .style("stroke", stroke)
                if @lefty
                        @svg.append("g")
                              .attr("class", "x axis")
                              .attr("transform", "translate(0," + @view.height + ")")
                              .call(@xAxis)
                yaxis = @svg.append("g")
                      .attr("class", "y axis #{daClass}")
                      .attr("transform", "translate(#{if @lefty then 0 else @view.width},0)")
                yaxis.call(@yAxis)
                      .style("stroke",stroke)
                yaxis.selectAll(".#{daClass}.y.axis text")
                      .style("text-anchor", if @lefty then "end" else "start" )
                      .attr("dx", if @lefty then 0 else "0.7em" )
                dy = -1
                if @units
                        yaxis.append("text")
                                .style("stroke",stroke)
                                .attr("y","#{dy}em")
                                .attr("font-size","0.8em")
                                .attr("text-anchor","middle")
                                .text("[#{@units}]")
                        dy = dy-1
                if @subtitle
                        yaxis.append("text")
                                .style("stroke",stroke)
                                .attr("y","#{dy}em")
                                .attr("font-size","0.9em")
                                .attr("text-anchor","middle")
                                .text(@subtitle)
                        dy = dy-1
                if @title
                        yaxis.append("text")
                                .style("stroke",stroke)
                                .attr("y","#{dy}em")
                                .attr("text-anchor","middle")
                                .text(@title)
                        dy = dy-1

                if @dataPointClass
                        dataPoints = new @dataPointClass(@view,@yscale)
                        dataPoints.draw(values,@scale)

class UsageBars
        constructor: (@view) ->
                @x = @view.x
                @usage_y = d3.scale.linear().domain([0,4]).range([@view.height, 0])

        draw: (values) ->
                @svg = @view.svg

                _.forEach( values, (d) ->
                        used = d._sums?.net_used
                        if used
                                if d._sums.net_allocated
                                        used = used / d._sums.net_allocated
                                else if d._sums.net_revised
                                        used = used / d._sums.net_revised
                                else
                                        used = null
                        if isNaN(used) then used = null
                        d.usage = used
                )

                bars = @svg.selectAll("rect.usage_bar")
                    .data(values)
                    .enter()
                bars.append("rect")
                        .attr("class","usage-bar")
                        .style("fill","lightblue")
                        .attr("x", (d) => @x(d.year-0.45))
                        .attr("width", (d) => @x(parseInt(d.year)+0.9) - @x(d.year))
                        .attr("height", (d) => @view.height - @usage_y(d.usage))
                        .attr("y", (d) => @usage_y(d.usage))
                bars.append("text")
                        .attr("class","usage-bar")
                        .attr("x", (d) => @x(d.year))
                        .attr("y", (d) => @usage_y(d.usage))
                        .attr("dy", "-0.3em")
                        .attr("font-size", "0.7em")
                        .attr("text-anchor", "middle")
                        .text((d) -> "#{parseInt(d.usage*100)}%")
                percent_line = @svg.append("g")
                    .attr("class","usage-bar")
                percent_line.append("svg:path")
                    .attr("stroke","steelblue")
                    .attr("d", "M#{@x.range()[0]},#{@usage_y(1)} L#{@x.range()[1]},#{@usage_y(1)}")
                    .attr("stroke-dasharray","5 5")
                percent_line.append("text")
                        .attr("dy", "-0.8em")
                        .attr("font-size","0.9em")
                        .text("תכנון מול ביצוע")
                        .attr("text-anchor","middle")
                        .style("stroke","black")
                        .attr("transform","translate(#{@x.range()[1]},#{@usage_y(0.5)}) rotate(-90)")


class HistoryLines
        constructor: (@view,@yscale,@scale) ->
                @x = @view.x

        draw: (values) ->
                @svg = @view.svg
                @svg.append("svg:defs")
                        .append("svg:marker")
                            .attr("id", "arrow")
                            .attr("viewBox", "0 -5 10 10")
                            .attr("refX", 10)
                            .attr("refY", 0)
                            .attr("markerWidth", 6)
                            .attr("markerHeight", 6)
                            .attr("orient", "auto")
                            .style("fill","red")
                            .style("stroke-width", 1)
                                .append("svg:path")
                                    .attr("d", "M0,-5L10,0L0,5")

                points = @svg.selectAll("g.history-lines")
                    .data(values)
                    .enter()
                        .append("g")
                            .attr("class","history-lines")
                points.append("svg:path")
                    .attr("d", (d) => @history_line(d,0))
                    .style("stroke","red")
                    .style("fill","none")
                    .attr("class","history-line")
                    .attr("marker-end", "url(#arrow)")
                points.append("svg:path")
                    .attr("d", (d) => @history_line(d,1))
                    .style("stroke","red")
                    .style("fill","none")
                    .attr("class","history-line")
                    .attr("marker-end", "url(#arrow)")

        history_line: (d,part) ->
                revised = d._sums.net_revised/@scale
                used = d._sums.net_used/@scale
                year = parseInt(d.year)
                if part == 0
                        allocated = d._sums.net_allocated/@scale
                        path = "M#{@x(year-0.76)},#{@yscale(allocated)}"
                        path += "L#{@x(year-0.56)},#{@yscale(allocated)}"
                        path += "M#{@x(year-0.66)},#{@yscale(allocated)}"
                        path += "L#{@x(year-0.33)},#{@yscale(revised)}"
                else if part == 1
                        path = ""
                        #path = "M#{@x(year-0.43)},#{@y(revised)}"
                        #path += "L#{@x(year-0.13)},#{@y(revised)}"
                        path += "M#{@x(year-0.33)},#{@yscale(revised)}"
                        path += "L#{@x(year)},#{@yscale(used)}"
                path


class GraphView extends Backbone.View

        initialize: (@options) ->
                _.bindAll @

                @reportModel = @options.reportModel
                @model.bind 'dataUpdated', @dataUpdated
                @reportModel.on 'change:comparison_series', @render
                @reportModel.on 'change:extra_details', @render
                @data = []

                @margin = 100
                @fullwidth = $(@el).innerWidth()
                @fullheight = @fullwidth * 0.67 # $(window).innerHeight() - $(@el).position().top
                @width = @fullwidth - 2*@margin
                @height = @fullheight - 2*@margin

                $(@el).css('width',@fullwidth)
                $(@el).css('height',@fullheight)

        getScale: (n) ->
                scale = 1
                prefix = ''
                if n/scale > 10000
                        scale = 1000
                        prefix = "אלף"
                if n/scale > 10000
                        scale = 1000000
                        prefix = "מיליון"
                if n/scale > 10000
                        scale = 1000000000
                        prefix = "מיליארד"
                return [scale,prefix]

        render: ->
                $(@el).html('')

                @max = 0
                for item in @data
                        values = _.map( _.filter( _.pairs(item), (i) -> i[0] != 'year' ), (i) -> i[1] )
                        item.values = _.omit( _.clone(item), 'year', '_maxs', '_sums', '_sum', '_max', 'values' )
                        item._sums = item._maxs = {}
                        for x in [ "value", "net_allocated", "net_used", "net_revised" ]
                                item._sums[x] = d3.sum( _.map( values, (i) -> if _.has(i,x) then i[x] else 0 ) )
                                item._maxs[x] = d3.max( _.map( values, (i) -> if _.has(i,x) then i[x] else 0 ) )
                        item._sum = item.value = item._sums["value"]
                        item._max = d3.max( _.values(item._maxs) )
                        max = d3.max( _.values(item._sums) )
                        if max > @max
                                @max = max

                [@scale, @prefix] = @getScale(@max)

                year_extent = d3.extent(@data, (d) -> d.year )
                year_extent[0] = parseInt(year_extent[0]) - 0.9
                year_extent[1] = parseInt(year_extent[1]) + 0.9

                @x = d3.scale.linear().domain( year_extent).range([0,@width]).clamp(true)
                @y = d3.scale.linear().domain([0,@max/@scale]).range([@height, 0])

                @svg = d3.select(@el).append("svg")
                            .attr("width", @fullwidth)
                            .attr("height", @fullheight)
                            .style("font-family", "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif")

                @svg.append("rect")
                        .attr("x",0)
                        .attr("y",0)
                        .attr("width",@fullwidth)
                        .attr("height",@fullheight)
                        .style("fill","white")
                        .style("stroke",null)

                @svg = @svg.append("g")
                          .attr("transform", "translate(" + @margin + "," + @margin + ")")

                comparison_series = @reportModel.get 'comparison_series'
                if comparison_series
                        values = comparison_series.get 'y'
                        values = _.pairs(values)
                        values = _.map(values, (i) -> { year: parseInt(i[0]), value:i[1].value } )
                        values = _.filter( values, (i) => @x.domain()[0] <= i.year <= @x.domain()[1]  )

                        numerator = comparison_series.get 'numerator'
                        if numerator == 'ש"ח נומינלי'
                                if @reportModel.get 'use_real_values'
                                        for v in values
                                                inflation = (inflationExtraData.get 'y')[v.year].value
                                                v.value = v.value/inflation
                                        numerator = 'ש"ח ריאלי'
                        max = d3.max( _.map(values,(i)->i.value) )
                        [scale,prefix] = @getScale(max)
                        @extra_yscale = d3.scale.linear().domain([0,max/scale]).range([@height, 0])

                        if comparison_series.get 'denominator'
                                units = "#{numerator} ל#{comparison_series.get 'denominator'}"
                        else
                                units = numerator
                        extraGraph = new MainGraph(@,false,comparison_series.get('title'),null,"#{prefix} #{units}",null,@extra_yscale,scale)
                        extraGraph.draw(values)

                if @reportModel.get 'extra_details'
                        usageBars = new UsageBars(@)
                        usageBars.draw(@data)

                mainGraph = new MainGraph(@,true,"נתוני התקציב",@normalization_title,"#{@prefix} #{@units}",BudgetDataPoints,@y,@scale)
                mainGraph.draw(@data)

                if @reportModel.get 'extra_details'
                        historyLines = new HistoryLines(@,@y,@scale)
                        historyLines.draw(@data)

                @subc = null
                @

        showbudgetpopup: (item,x,y,event) ->
                L "shown",item,x,y,event,d3.event
                template = _.template $("#budget-popup-template").html(), item
                $("#budget-popup").html(template)
                $("#budget-popup").css("display","inherit")
                $("#budget-popup").css("left",item.realx+$("svg").position().left)
                $("#budget-popup").css("top",item.realy+$("svg").position().top-item.r-$("#budget-popup").outerHeight())

        openDetail: (item,x,y,event) ->
                if not item
                        if @subc
                                @subc.remove()
                                @subc = null
                else
                        if @subc
                                @subc.remove()

                        diameter = @margin*2
                        format = d3.format(",d")
                        color = d3.scale.category20c()

                        bubble = d3.layout.pack()
                                        .sort((a,b) -> if a.first then -1 else if b.first then 1 else b.value-a.value)
                                        .size([diameter, diameter])
                                        .padding(1.5)

                        data = {key: "__", value:0, root:true, children:[{key: "__#{item.year}", first:true, value:d3.max([1,item._max/4])}]}

                        L "ZAZAZAZ", item
                        for k,v of item.values
                                if v != 0
                                        data.children.push key:k, value:v.value

                        nodes = bubble.nodes(data)
                        @subc = @svg.selectAll(".budget-circle").data(nodes).enter()
                                .append("g")
                                .attr("class","budget-circle")
                                .attr("transform", (d) -> "translate(" + (x+d.x-diameter/2) + "," +(y+d.y-diameter/2) + ")")
                                .each( (d) -> d.realx = x+d.x ; d.realy = y+d.y )

                        subc_first =   @subc.filter( (d) -> d.first )
                        subc_root =    @subc.filter( (d) -> d.root )
                        subc_regular = @subc.filter( (d) -> not (d.root or d.first) )

                        subc_regular.append("circle")
                                .attr("r", 0 )
                                .style("fill", (d) -> color(d.key) )
                                .on("mouseover", @showbudgetpopup )
                                .on("mouseout", (x) -> $("#budget-popup").css("display","none") )
                                .transition()
                                .attr("r", (d) -> d.r)
                                .duration(500)

                        subc_regular.append("text")
                                .style("text-anchor", "middle")
                                .attr("dy",  ".3em" )
                                .style("font-size", 1)
                                .text((d) -> "#{d.key.split('__')[0].substring(2)}" )
                                .transition()
                                .style("font-size", (d) -> d.r/2.5)
                                .duration(500)

                        subc_root.append("circle")
                                .attr("r", (d) -> d.r )
                                .style("fill", "#fff" )
                                .style("stroke-width", 2 )
                                .style("stroke", "steelblue" )
                                .style("opacity", 0.1 )

                        subc_first.append("rect")
                                .attr("width", (d) -> d.r*0.86*2 )
                                .attr("height", (d) -> d.r )
                                .attr("x", (d) -> -d.r*0.86 )
                                .attr("y", (d) -> -d.r*0.5 )
                                .style("fill", (d) -> "#fff")
                                .style("stroke-width", 2 )
                                .style("stroke", "steelblue" )

                        subc_first.append("text")
                                .style("text-anchor", "middle")
                                .attr("dy",  ".3em" )
                                .text((d) -> "#{d.key.split('__')[1]}" )

                        subc_first.append("text")
                                .style("text-anchor", "start")
                                .attr("dy", (d) -> -d.y+10  )
                                .attr("dx", (d) -> -d.x+diameter-10  )
                                .style("cursor","pointer")
                                .attr("font-size",20)
                                .text( "\u00d7" )
                                .on("click", (x) => @openDetail() )

                        ###
                        text = subc_regular.append("foreignObject")
                                .attr("x", -textbox_width/2 )
                                .attr("y", -textbox_height/2)
                                .attr("width", textbox_width)
                                .attr("height", textbox_height)
                                .attr("class","title-text")
                                .append("xhtml:body")
                                .attr("xmlns","http://www.w3.org/1999/xhtml")
                                .append("xhtml:div")
                                .attr("class","text-container")
                        text.text((d) -> "#{d.key.split('__')[1]}: #{d.value}")
                                .style("ba","#fff")

                        text.append("text")
                                .style("text-anchor", "middle")
                                .attr("x",0)
                                .attr("dy", (d) -> if d.first then ".3em" else "-.3em")
                                .text((d) -> if d.root then '' else if d.first then "#{d.key.split('__')[1]}" else "#{d.key.split('__')[1]}:")
                        text.append("text")
                                .style("text-anchor", "middle")
                                .attr("x",0)
                                .attr("dy",".6em")
                                .text((d) -> if d.first then "" else "")
                        ###

        dataUpdated: (items,units,normalization_title) ->
                @units = units
                @data = items
                @normalization_title = normalization_title
                @render()

$( ->
  $("#explanations-dialog").show()
  $("#explanations").carousel()
  $("#explanations-dialog").hide()

  $("#select-report").modal(show:false,keyboard:false)

  rootsModel           = new RootsModel
  allReportsCollection = new AllReportsCollection

  if report
          L "we have a report"
          reportModel          = new ReportModel(report)
          selectedItems        = new SelectedItemsCollection()
          selectedItems.setReportModel reportModel
          selectedItemsView    = new SelectedItemsView( el:$("#selected-items-list"), model: selectedItems )
          selectedItemsEditView = new EditableSelectedItemsView( el:$("#current-selection-editable"), model: selectedItems )

          graphView            = new GraphView( el:$("#graph-view"), model: selectedItems, reportModel: reportModel )

          reportModel.fetchAll(selectedItems)
          reportDetailsView    = new ReportDetailsView el:$("#report-details"),      model: reportModel
          reportDetailsForm    = new ReportDetailsForm el:$("#report-details-edit"), model: reportModel

          rootsTabbedView      = new RootsTabbedView el:$("#root-tabs"), model: rootsCollection

          searchBarView        = new SearchBarView el:$("#editor-search-bar")
          searchResultsView    = new SearchResultsView el:$("#search-results"), model: searchResultsCollection, selectedItemsModel: selectedItems

          breadCrumbs          = new BreadCrumbs
          breadCrumbsView      = new BreadCrumbsView el:$("#editor-breadcrumbs"), model: breadCrumbs

          dataSeriesView       = new DataSeriesView el:$("#chart-extradata"), model: reportModel

          $("#saved-successfully").modal(show:false)
  else
          L "report is null"
          allReportsView = new AllReportsView el:$("#all-reports"), model:allReportsCollection
          $("#select-report").modal('show')

  $("#share-this-report").click ->
        L "saving..."
        reportModel.set 'ids', selectedItems.pluck 'id'
        svg = $("#graph-view").html()
        L "SVG",svg
        reportModel.set 'svg', svg

        reportModel.url = "/upload"
        reportModel.save({},
                success: (model, response, options) ->
                        url = response.url
                        url = window.location.origin + url
                        L "url:",url
                        $("#saved-url").val url
                        $(".fb-like").attr "data-href", url
                        window.FB.XFBML.parse()
                        $("#saved-successfully").modal('show')
                error: -> L "error",@
                )

  $("#show-more-details").click ->
        L "show-more-details clicked"
        has_extra_details = reportModel.get 'extra_details'
        reportModel.set 'extra_details', not has_extra_details

  $("#search-year-slider").slider(
        max: 20,
        min: 0,
        values: [0,20],
        range: true
        slide: (e,ui) ->
                toyear = 2012-ui.values[0]
                fromyear = 2012-ui.values[1]
                $("#search-fromyear").html( "#{fromyear}" )
                $("#search-toyear").html( "#{toyear}" )
                searchTermModel.set 'toyear', toyear
                searchTermModel.set 'fromyear', fromyear
  )

  $("#show-year-slider").slider(
        max: 20,
        min: 0,
        values: [0,20],
        range: true
        slide: (e,ui) ->
                toyear = 2012-ui.values[0]
                fromyear = 2012-ui.values[1]
                $("#show-fromyear").html( "#{fromyear}" )
                $("#show-toyear").html( "#{toyear}" )
                reportModel.set 'toyear', toyear
                reportModel.set 'fromyear', fromyear
  )
)



