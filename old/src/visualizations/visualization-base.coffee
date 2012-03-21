class Visualization
    
    constructor: (@name,@iconurl) ->
        @data = null
        @year = null
    
    getIconUrl: -> @iconurl
    
    getName: -> @name
    
    setData: (data) -> 
        @data = data
        if not @initialized
            alert "#{@name} not initialized???"
            return
        @update(@data,@year)
        
    setYear: (year) ->
        if @isYearDependent()
            @year = year
            
    initialize: (@div_id) -> 
        @initialized = true

    update: -> alert "you should implement 'update' in visualization #{@name}"
    
    isYearDependent: -> alert "you should implement 'isYearDependent' in visualization #{@name}"

    isVisualization: -> true
