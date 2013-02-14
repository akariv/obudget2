main = null

class BudgetItem extends Backbone.Model
        defaults:
                c: ''
                y: {}
                t: ''
                selected: false
        urlRoot: '/api'
        initialize: ->
                @set 'selected', main?.visualization?.collection.isStarred (@get 'c'), (@get 't')
                console.log "setting ",(@.get 'c'),(@.get 't'),(@.get 'selected')


class BudgetItemView extends Backbone.View
        tagName: 'li'
        initialize: ->
                _.bindAll @
                @model.bind 'remove', @unrender
                @model.bind 'change:selected', @onSelected

                years = @model.get 'y'
                years = Object.keys(years)
                years.sort()

                @yearstr = null
                firstyear=null
                lastyear=null
                @addition = (firstyear,lastyear) ->
                        if firstyear == lastyear
                                "#{firstyear}"
                        else
                                "#{firstyear}&#8209;#{lastyear}"
                @update_yearstr = (firstyear,lastyear) ->
                        if @yearstr == null
                                @yearstr = @addition(firstyear,lastyear)
                        else
                                @yearstr += ", #{@addition(firstyear,lastyear)}"
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

        render: =>
                template = _.template $("#budget-item-template").html(), @
                $(@el).html template
                if @model.get 'selected' then @onSelected()
                @
        unrender: =>
                $(@el).remove()
        #remove: -> @model.destroy()
        onClick: ->
                console.log @model
                if @model.get 'd'
                        @trigger 'clicked', @

        onSelect: ->
                console.log @model
                @model.set 'selected', not @model.get 'selected'

        onSelected: ->
                console.log "onSelected", @model.get 'c'
                $(".selector",@el).toggleClass 'active', @model.get 'selected'

        events:
                "click .title"   : "onClick"
                "click .selector": "onSelect"

class BudgetHeaderView extends Backbone.View
        tagName: 'span'
        initialize: ->
                _.bindAll @
                @model.fetch()
        render: =>
                template = _.template $("#budget-list-header-tempalte").html(), @
                $(@el).html template
                @

class BudgetItemList extends Backbone.Collection
        model: BudgetItem
        comparator: (item) ->
                code = item.attributes.c
                years = Object.keys(item.attributes.y)
                if years.length > 0
                        year = years[0]
                else
                        year = 0
                "#{code}/#{year}"
        initialize: (@models,@options) ->
                @do_fetch()
                main.search.model.bind 'change', @do_fetch
        do_fetch: =>
                @url = "/api/S#{@options.origin}__#{main.search.model.get 'term'}"
                @fetch
                        success: ->
                        error: -> window.alert "error"

class BudgetItemListView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @header = new BudgetHeaderView
                        model: new BudgetItem
                                id: @options.origin
                @header.model.bind 'change', @updateHeader
                @collection = new BudgetItemList [], @options
                @collection.bind 'reset', @appendItems
                @collection.bind 'change:selected', @itemSelected
                @options.container.append( @render().el )
                @setOnTop true
                console.log "#{@options.origin} is now on top"
                $("body").keyup @keyUp

        render: ->
                template = _.template $("#budget-item-list-template").html(), @options
                $(@el).html template
                if @ontop
                        $(@el).focus()
                @

        unrender: =>
                $(@el).remove()

        updateHeader: (item) ->
                $(".header", @el).append @header.render().el

        appendItems: (list, collection, options) ->
                console.log list
                $('ul', @el).html('')
                for item in list.models
                        item_view = new BudgetItemView
                                model: item
                        item_view.bind 'clicked', @itemClicked
                        $('ul', @el).append item_view.render().el


        removeItem: (item) -> item.trigger('destroy')

        remove: (item) ->
                if @options.origin != 'I1' and @ontop
                        @header.remove()
                        $("body").unbind 'keyup', @keyUp
                        @trigger "closed"
                        @unrender()

        nextClosed: ->
                console.log "#{@options.origin} is now again on top"
                @setOnTop true

        itemSelected: (item,value,options) ->
                if value
                        main.visualization.collection.add( item.clone() )
                else
                        main.visualization.collection.remove( item.clone() )

        itemClicked: (item) ->
                if @ontop
                        @setOnTop false
                        list_view = new BudgetItemListView
                                container : @options.container
                                origin    : item.model.get("id")
                                depth     : @options.depth+1
                        list_view.bind 'closed', @nextClosed

        keyUp: (event) ->
                if event.keyCode == 27
                        @remove()

        setOnTop: (ontop) ->
                if ontop == @ontop then return
                if @ontop
                        @cachedHeight = $(@el).height()
                @ontop = ontop
                if ontop
                        $('.budget-list',@el).animate('height':@cachedHeight,300, () => console.log "done!!",@el ; $('.budget-list',@el).css('height',"auto"))
                else
                        $('.budget-list',@el).animate('height':50,300)

        events:
                "click .button-close": "remove"

class BudgetItemVisualization extends Backbone.Collection
        model: BudgetItem
        initialize: ->
                @on 'add', @updateData
                @on 'remove', @updateData
                @data = {}

        isStarred: (code,title) ->
                ret = _.filter( @models, (m) -> (m.get('c') == code) and (m.get('t') == title) ).length > 0
                console.log "isStarred",code,title,ret
                ret

        updateData: ->
                console.log "Data updated"
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
                                console.log(years)
                                if not data[year]
                                        data[year] = { "year": budget.year }
                                data[year][key] = budget.value
                @data = []
                for k,v of data
                        @data.push(v)
                console.log JSON.stringify(@data)
                @trigger 'dataUpdated', @data

class BudgetItemVisualizationView extends Backbone.View
        initialize: (@options) ->
                _.bindAll @
                @collection = new BudgetItemVisualization [], @options
                @collection.bind 'dataUpdated', @dataUpdated
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
                #@stack = d3.layout.stack()
                #         .values( (d) -> d.values )

                #keys = _.keys(@data[0]).filter( (key) -> key != "year" )
                #codes = _.object( _.map(keys, (x) -> [x.split('__')[0] ,x] ))
                #@color.domain( _.map(keys, (x) -> x.split('__')[0]) )
                #values = @stack( keys.map ( (key) => { key: key, values: @data.map( (d) -> year:d.year, y:d[key] ) } ))
                values = @data
                @x.domain( d3.extent(@data, (d) -> d.year ))
                console.log values

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
                console.log "shown",item,x,y,event,d3.event
                template = _.template $("#budget-popup-template").html(), item
                $("#budget-popup").html(template)
                $("#budget-popup").css("display","inherit")
                $("#budget-popup").css("left",item.realx+$("svg").position().left)
                $("#budget-popup").css("top",item.realy+$("svg").position().top-item.r-$("#budget-popup").outerHeight())

        detail: (item,x,y,event) ->
                console.log item,x,y,@subc
                if not item
                        if @subc
                                @subc.remove()
                                @subc = null
                else
                        console.log "rmv0", @subc
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

class Search extends Backbone.Model
        defaults:
                term: ''

class SearchView extends Backbone.View
        initialize: ->
                @render()
                @model = new Search
        render: ->
                template = _.template $("#search-template").html(), {}
                console.log @el
                $(@el).html template
        events:
                "click input[type=button]": "doSearch"
                "keyup input[type=text]":  "doSearch"
        doSearch: (event) ->
                @model.set term: $("#search_input").val()

class MainLayout extends Backbone.View
        el: $ "#layout"
        doInit: ->
                @render()
                @search = new SearchView
                        el: $('.search',@el)
                @treenav = new BudgetItemListView
                        container: $('.treenav', @el)
                        origin:'I1'
                        depth:0
                @visualization = new BudgetItemVisualizationView
                        el: $('.graph',@el)
        render: ->
                template = _.template $("#main-layout-template").html(), {}
                $(@el).html template

$( ->
        main = new MainLayout
        main.doInit()
)
