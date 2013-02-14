L = (x...) -> console.log x...

globalHandleError = -> alert "error"

###################################
#################### Budget Items #
###################################

class ItemModel extends Backbone.Model
        defaults:
                id: null
        urlRoot: '/api'
        initialize: ->
                @on 'change:y', @setYearstr
                @on 'change:expl', @setExplanations
                @on 'change:t', @setTitle

                if (@get 'expl') then @setExplanations()
                if (@get 't') then @setTitle()
                if (@get 'y') then @setYearstr()

        fixText: (t) ->
                t = t.replace(/\n/g,"<br/>")
                t = t.replace(/\"/g, "&quot;")
                t = t.replace(/\(/g, "XXXXXXX")
                t = t.replace(/\)/g, "(")
                t = t.replace(/XXXXXXX/g, ")")
                if t.length > 2000
                        t = t[0..2000]+"..."
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
        initialize: ->
                L "SelectedItemsCollection::initialize"
                @on 'add remove', @updateData

        updateData: ->
                L "SelectedItemsCollection::updateData"
                data = {}
                for model in @models
                        years = model.get 'y'
                        for year,budget of years
                                data[year] = { "year": year }
                for model in @models
                        years = model.get 'y'
                        title = model.get 't'
                        code = model.get 'c'
                        key = "#{code}__#{title}"
                        for year,budget of data
                                data[year][key] = 0
                        for year,budget of years
                                if not data[year]
                                        data[year] = { "year": budget.year }
                                data[year][key] = budget.value
                @data = []
                for k,v of data
                        @data.push(v)
                L "SelectedItemsCollection::updateData: @data=",JSON.stringify(@data)
                @trigger 'dataUpdated', @data

selectedItems = new SelectedItemsCollection

############################
#################### Graph #
############################

class GraphView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @model.bind 'dataUpdated', @dataUpdated
                @data = []

                @margin = 75
                @fullwidth = $(@el).innerWidth()
                @fullheight = @fullwidth * 0.67 # $(window).innerHeight() - $(@el).position().top
                @width = @fullwidth - 2*@margin
                @height = @fullheight - 2*@margin

                $(@el).css('width',@fullwidth)
                $(@el).css('height',@fullheight)

        render: ->
                $(@el).html('')

                @max = 0
                for item in @data
                        values = _.map( _.filter( _.pairs(item), (i) -> i[0] != 'year' ), (i) -> i[1] )
                        item.values = _.omit( _.clone(item), 'year' )
                        item._sum = d3.sum( values )
                        item._max = d3.max( values )
                        if item._sum > @max
                                @max = item._sum

                @x = d3.scale.linear().range([0,@width])
                @y = d3.scale.linear().domain([0,@max]).range([@height, 0])
                @xAxis = d3.svg.axis()
                            .scale(@x)
                            .orient("bottom")
                            .tickFormat(d3.format("d"))
                @yAxis = d3.svg.axis()
                            .scale(@y)
                            .orient("left")
                @line = d3.svg.line()
                            .x( (d) => @x(parseInt(d.year)) )
                            .y( (d) => @y(d._sum) )
                @svg = d3.select(@el).append("svg")
                            .attr("width", @fullwidth)
                            .attr("height", @fullheight)
                            .append("g")
                            .attr("transform", "translate(" + @margin + "," + @margin + ")")
                values = @data
                @x.domain( d3.extent(@data, (d) -> d.year ))
                L "values: ", values

                @svg.append("path")
                        .datum(@data)
                        .attr("class", "line")
                        .attr("d", (d) => @line(d))
                        .style("fill","none")
                        .style("stroke","steelblue")
                @svg.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + @height + ")")
                      .call(@xAxis);
                @svg.append("g")
                      .attr("class", "y axis")
                      .call(@yAxis);
                @svg.selectAll("circle")
                    .data(@data)
                    .enter()
                    .append("circle")
                    .attr("cx",(d) => @x(d.year))
                    .attr("cy",(d) => @y(d._sum))
                    .attr("r",10)
                    .style("fill","white")
                    .style("stroke","steelblue")
                    .style("cursor","pointer")
                    .on("click",(d,i) => @detail(d,@x(d.year),@y(d._sum),d3.event))

                #@svg.selectAll(".item")
                #       .data(values)
                #       .selectAll('path')
                #       .transition()
                #               .duration(1000)
                #                .attr("d", (d) => @line(d))

                @subc = null
                @

        showbudgetpopup: (item,x,y,event) ->
                L "shown",item,x,y,event,d3.event
                template = _.template $("#budget-popup-template").html(), item
                $("#budget-popup").html(template)
                $("#budget-popup").css("display","inherit")
                $("#budget-popup").css("left",item.realx+$("svg").position().left)
                $("#budget-popup").css("top",item.realy+$("svg").position().top-item.r-$("#budget-popup").outerHeight())

        detail: (item,x,y,event) ->
                L item,x,y,@subc
                if not item
                        if @subc
                                @subc.remove()
                                @subc = null
                else
                        L "rmv0", @subc
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
                        for k,v of item.values
                                if v != 0
                                        data.children.push key:k, value:v

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
                                .text((d) -> "#{d.key.split('__')[0]}" )
                                .transition()
                                .style("font-size", (d) -> d.r/3)
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
                                .style("text-anchor", "end")
                                .attr("dy", (d) -> -d.y+10  )
                                .attr("dx", (d) -> -d.x+diameter-10  )
                                .style("cursor","pointer")
                                .attr("font-size",20)
                                .text( "\u00d7" )
                                .on("click", (x) => @detail() )

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


        dataUpdated: (items) ->
                @data = items
                @render()

#############################
#################### Report #
#############################
class ReportModel extends Backbone.Model
        defaults:
                items: []
        initialize: ->
                for id in @get 'ids'
                        L "loading #{id} from report"
                        item = new ItemModel id:id
                        item.fetch
                                success: (model,response,options) ->
                                        L "loaded #{id} from report"
                                        selectedItems.add(model)
                                error: globalHandleError

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
                @model.bind 'add remove', @render
                @render()

        render: ->
                $(@el).html ""
                L "SelectedItemsView::render"
                for item in @model.models
                        template = _.template $("#selected-items-list-template").html(), item
                        $(@el).append template
                $("[data-toggle='popover']").popover({})

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
                L "RootsCollection::comparator",item,(item.get 'id')
                item.get 'id'

rootsCollection = new RootsCollection

class RootsTabbedView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.bind 'add remove', @render
                @render()

        render: ->
                L "RootsTabbedView::render", @el
                @$(".root-tab").remove()
                for item in @model.models
                        L "RootsTabbedView::render", item
                        template = _.template $("#roots-tab-template").html(), item
                        @$("#editor-search-bar").before template
                @$(".root-tab a").click( (e) =>
                        @$(".root-tab").toggleClass('active',false)
                        @$(e.currentTarget).parent().toggleClass('active',true)
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else model = null
                        L "ZZZZZ",model
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

searchResultsCollection = new SearchResultsCollection

class SearchResultsView extends Backbone.View
        initialize: ->
                _.bindAll @
                @model.on 'add remove reset', @render
                @render()
                L "SearchResultsView::initialize ",@model

        render: ->
                @$(".budget-item").remove()
                for item in @model.models
                        template = _.template $("#search-result-template").html(), item
                        $(@el).append template
                @setupEvents(@$("tr"))
                @$("[data-toggle='popover']").popover({})

        setupEvents: (el) ->
                L "SearchResultsView::setupEvents",el
                $("a",el).click (e) =>
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else model = null
                        searchTermModel.set 'origin', model
                        false
                $(el).click (e) =>
                        id = @$(e.currentTarget).attr('data-id')
                        model = @model.where id:id
                        if model.length == 1 then model = model[0] else return
                        if model.isSelected()
                                L "SearchResultsView::render:: removing ",model
                                selectedItems.remove(model)
                        else
                                selectedItems.add(model)
                        template = _.template $("#search-result-template").html(), model
                        @$(e.currentTarget).replaceWith template
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
                L "filtered:",filtered

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



$( ->
  $("#explanations-dialog").show()
  $("#explanations").carousel()
  $("#explanations-dialog").hide()

  rootsModel           = new RootsModel

  graphView            = new GraphView( el:$("#graph-view"), model: selectedItems )
  selectedItemsView    = new SelectedItemsView( el:$("#selected-items-list"), model: selectedItems )

  reportModel          = new ReportModel(report)
  reportDetailsView    = new ReportDetailsView el:$("#report-details"),      model: reportModel
  reportDetailsForm    = new ReportDetailsForm el:$("#report-details-edit"), model: reportModel

  rootsTabbedView      = new RootsTabbedView el:$("#root-tabs"), model: rootsCollection

  searchBarView        = new SearchBarView el:$("#editor-search-bar")
  searchResultsView    = new SearchResultsView el:$("#search-results"), model: searchResultsCollection

  breadCrumbs          = new BreadCrumbs
  breadCrumbsView      = new BreadCrumbsView el:$("#editor-breadcrumbs"), model: breadCrumbs

  $("#saved-successfully").modal(show:false)

  $("#share-this-report").click ->
        L "saving..."
        reportModel.set 'ids', selectedItems.pluck 'id'
        reportModel.url = "/upload"
        reportModel.save({},
                success: (model, response, options) ->
                        url = response.url
                        url = window.location.origin + url
                        L "url:",url
                        $("#saved-url").val url
                        $("#saved-successfully").modal('show')
                error: -> L "error",@
                )
)
