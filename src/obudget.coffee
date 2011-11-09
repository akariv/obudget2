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
    popup = '<div id="result-container" class="result-table">
                <div id="row_1" class="result-row">
                    <div id="results" class="result-cell">
                        <h1>תוצאות חיפוש</h1>
                        <div class="loader" id="res_loader">
                            <img class="loader" src="images/ajax-loader.gif"/>
                        </div>
                        <div class="scroll" id="res_scroller">
                        </div>
                    </div>
                    <div class="result-cell">
                        <h1>הכי נצפים בשבוע האחרון</h1>
                    </div>
                 </div>
                 <div id="row_2" class="result-row">
                    <div class="result-cell">
                        <h1>תגובות רלוונטיות</h1>
                    </div>
                    <div class="result-cell">
                        <h1>הכי מדוברים בשבוע האחרון</h1>
                    </div>
                 </div>
             </div>'

class SearchUI
    #constructor : ->
    #    @load_search()
    
    load_search : =>
        @search_path = "/data/hasadna/budget-ninja/"
        
        @$dialog = $('<div></div>')
        @$dialog.html(build_results_popup())
        #TBD width and height should be relative to screen size
        @$dialog.dialog({autoOpen: false, title: 'תוצאות חיפוש', width: 1200, height: 400})
        @result_template = "<a class='result-cell' id={{hash}} href='obudget.html\#{{hash}}'>
                                <span class='result-cell'>{{title}} , {{max_year}} - {{min_year}}</span>
                             </a><br/>"
                
        $("#search").append("<input id='search-box' type='text'></input>")
        $("#search").append("<a><span class='button' id='search-button'>חפש</span></a>")
        $("#search-button").mouseup((e)->
                                    $('#search-button').removeClass('button-pressed')
                                    $('#search-button').addClass('button'))
        $("#search-button").mousedown((e)->
                                    $('#search-button').removeClass('button')
                                    $('#search-button').addClass('button-pressed')
                                    window.ob.search_db($("#search-box").val()))
        $("#search-box").keypress((e)->
                                    window.searchUI.search_db($(this).val()) if e.keyCode == 13)
        $("#search-box").blur((e)->
                                search_focus=false;
                                $(this).val("")
                                $.Watermark.ShowAll())
        $("#search-box").focus((e)->
                            $(this).val("")
                            search_focus=true
                            $.Watermark.HideAll())
        $("#search-box").Watermark("חיפוש")
    
    search_db : (string) =>
        @$dialog.dialog("open")
        $("#res_scroller").hide()
        $("#res_loader").show()
        H.findRecords(@search_path,@handle_search_results,{"title":{"$regex":string}},null,1,100)
    
    handle_search_results: (data) =>
        $("#res_scroller").html("")
        $("#res_scroller").show()
        $("#res_loader").hide()
        @append_table_row record for record in data
    
    append_table_row: (record) =>
        year_list = []
        year_list.push(parseInt(year)) for own year, value of record.sums
        min_year = Math.min.apply(null, year_list)
        max_year = Math.max.apply(null, year_list)
        hash = record._src.split("/")[3]
        data = {hash: hash, min_year: min_year, max_year: max_year, title: record.title}
        $("#res_scroller").append(Mustache.to_html(@result_template,data))
             
    hideResultPopup : ->
        @$dialog.dialog("close")
                

set_active_year = (year) ->
    $(".year-sel").toggleClass('active',false)
    $(".year-sel[rel=#{year}]").toggleClass('active',true)
         
# Data Loading Routines

class OBudget
    constructor: ->
        @visualizations = {}
        @visualization_names = []
        @selected_visualization = null
        @year = 2010  
        window.onhashchange = @hash_changed_handler

        year_sel_click = (obj) ->
            return  -> 
                if $(this).hasClass('enabled')
                    year = $(this).attr('rel')
                    obj.select_year(parseInt year)
        $(".year-sel").click year_sel_click(this)        

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

    select_year: (year) ->
        v = @visualizations[@selected_visualization]
        v.setYear year 
        set_active_year year
        v.setData @loaded_data

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

$ ->       
    window.searchUI = new SearchUI
    window.searchUI.load_search()
    
    window.ob = new OBudget  
    window.ob.load_visualizations( new HcAreaChart, 
                            new HcPieChart,
                            new ItemInfo )
    window.ob.hash_changed_handler()
    
