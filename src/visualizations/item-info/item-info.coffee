
class ItemInfo extends Visualization
    
    constructor: ->
        super("ItemInfo","images/numbers256.png")

    initialize: (div_id) ->
        super(div_id)
                            
    update: (data,year) -> 
        years = (year for year of data.sums)
        table = {}
        for ref in data.refs
            unless ref.title 
                continue
            key = "#{ref.code}|||#{ref.title}"
            unless table[key]
                table[key] = {}
            table[key][ref.year] = ref

        content = [ "<td></td><td>" + years.join("</td><td>") + "</td>" ]
        
        for key, item_years of table
            [code, title] = key.split("|||",2)
            s = [ "#{code}/#{title}" ]
            for year in years
                ref = item_years[year]
                s[s.length] = ref?.gross_revised ? ''
                
            content[content.length] = "<td>" + s.join("</td><td>") + "</td>" 
        
        content = "<tr>" + content.join("</tr><tr>") + "</tr>"
        $("##{@div_id}").html("<table class='iteminfo'>#{content}</table>")        
         
    isYearDependent: -> false

    