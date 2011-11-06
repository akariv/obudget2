# View related routines 

set_loading = (is_loading) ->

set_current_description = (description) ->
    $("#current-description").html("#{description}")

set_current_source = (source) ->
    $("#current-source").html("#{source}")

set_current_title = (title) ->
    $("#current-title").html("#{title}")

set_active_years = (years) -> 
    $(".year-sel").toggleClass('disabled',true)
    $(".year-sel").toggleClass('enabled',false)
    for year in years
        $(".year-sel[rel=#{year}]").toggleClass('disabled',false)
        $(".year-sel[rel=#{year}]").toggleClass('enabled',true)

# search related routines

# should be replaced by an AJAX call to a server view
build_results_popup = () ->
    $('#result-container').append('<div id="row_1" class="result-row"></div>')
    $('#row_1').append('<div id="results" class="result-cell"></div>')              
    $('#row_1').append('<div class="result-cell"><h1>הכי נצפים בשבוע האחרון</h1></div>')
    $('#result-container').append('<div id="row_2" class="result-row"></div>')
    $('#row_2').append('<div class="result-cell"><h1>תגובות רלוונטיות</h1></div>')
    $('#row_2').append('<div class="result-cell"><h1>הכי מדוברים בשבוע האחרון</h1></div>')
    $("#results").html("<h1>תוצאות חיפוש</h1>")

mouse_is_inside     = false
search_key_pressed  = false
search_focus        = false

class SearchUI
    #constructor : ->
    #    @load_search()
    
    load_search : =>
        # TBD - replace with AJAX call
        build_results_popup()
                
        $('#result-container').hover(@hoverStart, @hoverEnd)
        $("body").mouseup(@mouseUpCbk)
        $("#search").append("<input id='search-box' type='text'></input>")
        $("#search").append("<a><span class='button' id='search-button'>חפש</span></a>")
        $("#search-button").mouseup((e)->
                                    $('#search-button').removeClass('button-pressed')
                                    $('#search-button').addClass('button')
                                    search_key_pressed = false)
        $("#search-button").mousedown((e)->
                                    search_key_pressed = true
                                    $('#search-button').removeClass('button')
                                    $('#search-button').addClass('button-pressed')
                                    window.ob.search_db($("#search-box").val()))
        $("#search-box").keypress((e)->
                                evt=window.event || e
                                code = if evt.keyCode then evt.keyCode else evt.which
                                if code == 13
                                    evt.target=evt.srcElement if (!evt.target)
                                    window.ob.search_db(evt.target.value)
                                )
        $("#search-box").blur((e)->
                                evt=window.event || e
                                evt.target=evt.srcElement if (!evt.target)
                                search_focus=false;
                                evt.target.value = ""
                                $.Watermark.ShowAll())
        $("#search-box").focus((e)->
                            evt=window.event || e
                            evt.target=evt.srcElement if (!evt.target)
                            search_focus=true
                            evt.target.value = ""
                            $.Watermark.HideAll())
        $("#search-box").Watermark("חיפוש")
    
    append_table_row: (record) =>
        year_list = []
        year_list.push(parseInt(year)) for own year, value of record.sums
        min_year = Math.min.apply(null, year_list)
        max_year = Math.max.apply(null, year_list)
        hash = record._src.split("/")[3]
        $("#res_scroller").append("<a class='result-cell' id=#{hash} href='obudget.html##{hash}'></a><br/>")
        flat_title = record.title.replace(/\n/g,'')
        flat_title = flat_title.replace(/\r/g,'')
        $("##{hash}").append("<span class='result-cell'>#{flat_title} , #{max_year} - #{min_year}</span>")
        #$("##{hash}").append("<span class='result-cell'></span>")
    
    handle_search_results: (data) =>
        $("#res_scroller").html("")
        $("#res_scroller").removeClass("loader")
        $("#res_scroller").addClass("scroll")
        @append_table_row record for record in data
 
    hoverStart : ->
        mouse_is_inside=true

    hoverEnd : ->
        mouse_is_inside=false

    mouseUpCbk : ->
        if mouse_is_inside == false and search_key_pressed == false
            $('#result-container').hide()
            
    hideResultPopup : ->
        $('#result-container').hide()
                
# Data Loading Routines

class OBudget
    constructor: ->
        @visualizations = {}
        @visualization_names = []
        @selected_visualization = null
        @year = 2010  
        window.onhashchange = @hash_changed_handler
        @search_path = "/data/hasadna/budget-ninja/"
    
    hash_changed_handler : ->
        window.searchUI.hideResultPopup()
        hash = window.location.hash
        # "this" object does not point to the Obudget object after reloading the page
        window.ob.load_item(hash[1..hash.length])

    load_item : (hash) ->
        set_loading(true);
        H.getRecord( "/data/hasadna/budget-ninja/#{hash}", 
                     @handle_current_item )

    handle_current_item : (data) =>
        @loaded_data = $.extend({},data);
        #$("#credits").html(JSON.stringify(data))
        set_loading(false);
        set_current_title(data.title)
        set_current_source(data.source)
        set_current_description(data.notes)
        years = (year for year of data.sums)
        set_active_years(years)
        @select_visualization()
        # set_refs(data.refs)

    select_visualization: (name) ->
        if not name
            name = @selected_visualization ? @visualization_names[0]
        @selected_visualization = name
        v = @visualizations[name]
        $(".vis-content").toggleClass "active",false
        $("#vis-#{name}").toggleClass "active",true
        $(".vis-button").toggleClass "active",false
        $("#vis-#{name}-button").toggleClass "active",true
        $("#year-selection").toggleClass("disabled", not v.isYearDependent())
        $("#year-selection").toggleClass("enabled", v.isYearDependent())
        v.setYear @year
        v.setData @loaded_data

    load_visualizations: (visualizations...) ->
        for v in visualizations
            name = v.getName()
            @visualizations[name] = v
            @visualization_names[@visualization_names.length] = name
            
            $("#vis-contents").append("<div class='vis-content' id='vis-#{name}'>#{name}</div>")
            $("#vis-buttons").append("<span class='vis-button' id='vis-#{name}-button'></span>")
            iconurl = v.getIconUrl()
            $("#vis-#{name}-button").css("background-image","url(#{iconurl})")

            x = (name) =>
                => @select_visualization name

            $("#vis-#{name}-button").click x(name)

            v.initialize("vis-#{name}")

    search_db : (string) ->
        $("#results").html("<h1>תוצאות חיפוש</h1>")
        $("#results").append("<div class='loader' id='res_scroller'></div>")
        $("#res_scroller").append("<img class='loader' src='images/ajax-loader.gif'/>")
        $("#result-container").show()
        H.findRecords(@search_path,window.searchUI.handle_search_results,{"title":{"$regex":string}},null,1,100)

$ ->       
    window.searchUI = new SearchUI
    window.searchUI.load_search()
    
    window.ob = new OBudget  
    window.ob.load_visualizations( new HcAreaChart, 
                            new HcPieChart,
                            new ItemInfo )
    window.ob.hash_changed_handler()
    
