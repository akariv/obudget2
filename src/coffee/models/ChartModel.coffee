class $.Model
	_instance = undefined # Must be declared here to force the closure on the class
	@get: (args) -> # Must be a static method
		_instance ?= new _Singleton args

# The actual Singleton class
class _Singleton
	constructor: (@args) ->
		that = this
		###
		our local cache  of data
		###
		@cache = []
		###
		who is listening to us?
		###
		@listeners = []

		@loading = false
		###
		load a json response from an ajax call
		###
		@loadResponse = (data) ->
			that.loading = false
			console.log data
			that.cache[data._src] = data
			that.notifyItemLoaded data
			return

		###
		tell everyone the item we've loaded
		###
		@notifyItemLoaded = (item) ->
			$.each(that.listeners, (i) ->
				that.listeners[i].loadItem item
				return)
			return

	getData : (slug) =>
		if @loading
			return
		else
			H.getRecord("/data/hasadna/budget-ninja/" + "00_e4eee3e9f0e4", @loadResponse)
			@loading = true
		return

	###
	add a listener to this model
	###
	addListener : (list) =>
		console.log this
		@listeners.push list
		return

$.extend
	Model1 : ->

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
