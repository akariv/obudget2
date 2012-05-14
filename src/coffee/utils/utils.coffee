$.extend
	titleToUrl : (data) ->
		(data.title.replace " ", "-") + "?vid=" + data.vid
	titleToOnClick : (data) ->
		"History.pushState({vid:'" + data.vid + "',rand:Math.random()}, '" + data.title + "', '" + $.titleToUrl(data) + "'); return false;"
