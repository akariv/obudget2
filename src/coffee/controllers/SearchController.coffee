# TODO make this calss a singelton
class $.Search
	constructor : ($searchbox, $searchresults)->
		@$searchbox = $searchbox
		@$searchresults = $searchresults
		return
	init : ->
		searchbox = @$searchbox
		searchresults = @$searchresults
		@$searchbox.keypress (e)->
			if e.keyCode == 13
				console.log "** " + searchbox.val()
				url = 'http://api.yeda.us/data/hasadna/budget-ninja/'
				# #query data for budget-ninja has to be formatted like this
				qdata =
					query: '{\"title\":\"' + searchbox.val() + '\"}'
					o : 'jsonp'
				$.get url, qdata, (data) ->
					$.each data, (index, value)->
						mus_data =
							title : value.title
							vid : value._src
						$.extend value, {mus_onclick: $.titleToOnClick mus_data}
						return
					#wrap the results in a json structure for Mustache
					data =
						searchresults : data
					searchresults.html Mustache.to_html $.mustacheTemplates.searchresults, data
				,"jsonp"



				e.preventDefault()
			return
		return