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

# Data Loading Routines

class OBudget
    constructor: ->
        @visualizations = {}
        @visualization_names = []
        @selected_visualization = null
        @year = 2010  
        @mouse_is_inside = false;
        @search_focus = false;
        window.onhashchange = @hash_changed_handler

    hash_changed_handler : ->
        hash = window.location.hash
        @load_item(hash[1..hash.length])
	
    
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
    
    append_table_row: (record, index) =>
        $("#res_scroller").append("<span class='result-cell'>#{record.title}</span>")
        $("#res_scroller").append("<span class='result-cell'>#{record.year}</span><br/>")
    
    handle_search_results: (data) =>
        $("#results").html("<h1>תוצאות חיפוש</h1>")
        $("#results").append("<div class='scroll' id='res_scroller'></div>")
        @append_table_row record,_i for record in data

    hoverStart : ->
        @mouse_is_inside=true 
        
    hoverEnd : ->
        @mouse_is_inside=false

    mouseUpCbk : ->
        if !@mouse_is_inside
            $('#result-container').hide()
            if @search_focus
                $("#search-box").val("")
                $.Watermark.ShowAll()

    load_search : =>
        $('#result-container').append('<div id="row_1" class="result-row"></div>')
        $('#row_1').append('<div id="results" class="result-cell"></div>')
        $('#row_1').append('<div class="result-cell">הכי נצפים בשבוע האחרון</div>')
        $('#result-container').append('<div id="row_2" class="result-row"></div>')
        $('#row_2').append('<div class="result-cell">תגובות רלוונטיות</div>')
        $('#row_2').append('<div class="result-cell">הכי מדוברים בשבוע האחרון</div>')
        $('#result-container').hover(@hoverStart, @hoverEnd)
        $("body").mouseup(@mouseUpCbk)
        $("#search").append("<input id='search-box' type='text' onfocus='search_focus=true;$(\"#search-box\").val(\"\");$.Watermark.HideAll();' onblur='search_focus=false;$(\"#search-box\").val(\"\");$.Watermark.ShowAll();' onchange='window.ob.search_db(this.value)'></input>")
        $("#search-box").Watermark("חיפוש")
        @search_path = "/data/gov/mof/budget/"	
        $("#results").html("<h1>תוצאות חיפוש</h1>")
    
    search_db : (string) ->
        $("#result-container").show()
        H.findRecords(@search_path,@handle_search_results,{"title":{"$regex":string}},null,1,100)
        

$ ->       
    window.ob = new OBudget  
    window.ob.load_visualizations( new HcAreaChart, 
                            new HcPieChart,
                            new ItemInfo )
    window.ob.hash_changed_handler()
    window.ob.load_search()
