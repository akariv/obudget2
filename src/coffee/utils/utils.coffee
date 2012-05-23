$.extend
	titleToUrl : (data) ->
		newtitle = (data.title.replace /\ /g , "-") + "?vid=" + data.vid
		console.log "replaced " + data.title + " with " + newtitle
		return newtitle

	titleToOnClick : (data) ->
		"History.pushState({vid:'" + data.vid + "',rand:Math.random()}, '" + data.title + "', '" + $.titleToUrl(data) + "'); return false;"
