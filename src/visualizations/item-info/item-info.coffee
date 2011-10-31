
class ItemInfo extends Visualization
    
    constructor: ->
        super("ItemInfo","images/numbers256.png")

    initialize: (div_id) ->
        super(div_id)
                            
    update: (data,year) -> 
        years = (year for year of data.sums)
        table = {}
        keys = []
        for ref in data.refs
            unless ref.title 
                continue
            padding = "00000000000000"[0..(14-ref.code.length)]
            key = "#{padding}|||#{ref.code}|||#{ref.title}"
            unless table[key]
                table[key] = {}
                keys[keys.length] = key
            table[key][ref.year] = ref

        content = [ "<td></td><td>" + years.join("</td><td>") + "</td>" ]
        
        keys = keys.sort()
        
        for key in keys
            item_years = table[key]
            [padding,code, title] = key.split("|||",3)
            s = [ "#{code}/#{title}" ]
            for year in years
                ref = item_years[year]
                s[s.length] = ref?.gross_revised ? ''
                
            content[content.length] = "<td>" + s.join("</td><td>") + "</td>" 
        
        content = "<tr>" + content.join("</tr><tr>") + "</tr>"
        $("##{@div_id}").html("<table class='iteminfo'>#{content}</table>")        
         
    isYearDependent: -> false

    