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
			if e.keyCode == 13 #CR: Are you sure that this is the most elegant way of doing this?
				console.log searchbox.val()
                                #CR: Why are you accessing the old budget site?
				url = "http://budget.msh.gov.il/00?text=" + searchbox.val() + "&full=1&num=20&distinct=1"
				$.get url, (data) ->
					#wrap the results in a json structure for Mustache
					data =
						searchresults : data
					searchresults.html Mustache.to_html ($ "#_" + searchresults[0].id).html(), data
				,"jsonp"



				e.preventDefault()
			return
		return