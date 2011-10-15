

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
    for year in years
        $(".year-sel[rel=#{year}]").toggleClass('disabled',false)
         
# Data Loading Routines

handle_current_item = (data) ->
    #$("#credits").html(JSON.stringify(data))
    set_loading(false);
    set_current_title(data.title)
    set_current_source(data.source)
    set_current_description(data.notes)
    years = (year for year of data.sums)
    set_active_years(years)
    # set_refs(data.refs)
    update_area_chart("vis-graph",data)
    update_pie_chart("vis-pie",2009,data)
    
load_item = (hash) ->
    set_loading(true);
    H.getRecord( "/data/hasadna/budget-ninja/#{hash}", 
                 handle_current_item )
    
# Main Document Routines 

hash_changed_handler = ->
    hash = window.location.hash
    load_item(hash[1..hash.length])

$ -> 
    $(".vis-button").click ->
        rel = $(this).attr "rel"
        $(".vis-content").toggleClass "active",false
        $(rel).toggleClass "active",true
        $(".vis-button").toggleClass "active",false
        $(this).toggleClass "active",true
    
    hash_changed_handler()    
        
    window.onhashchange = hash_changed_handler
