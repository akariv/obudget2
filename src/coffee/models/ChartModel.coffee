$.extend
	ChartModel : ->
		###
		our local cache  of data
		###
		cache = []
		###
		a reference to ourselves
		###
		that = this
		###
		who is listening to us?
		###
		listeners = []
		###
		load a json response from an ajax call
		###
		loadResponse = (data) ->
			console.log data
			cache[data._src] = data
			that.notifyItemLoaded data
			return

		this.getData = (slug) ->
			H.getRecord("/data/hasadna/budget-ninja/" + "00_e4eee3e9f0e4", loadResponse)

		###
		add a listener to this model
		###
		this.addListener = (list) ->
			listeners.push list
			return

		###
		tell everyone the item we've loaded
		###
		this.notifyItemLoaded = (item) ->
			$.each(listeners, (i) ->
				listeners[i].loadItem item
				return)
			return

		return

	###
	allow people create listeners easily
	###
	ModelListener : (list = {}) ->
		$.extend(
			loadBegin : ->
			loadFinish : ->
			loadItem : ->
			loadFail : ->
		,list);

