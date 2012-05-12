$.extend
	titleToUrl : (data) ->
		(data.title.replace " ", "-") + "?vid=" + data.vid