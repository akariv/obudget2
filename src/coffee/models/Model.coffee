class $.Model
	_instance = undefined # Must be declared here to force the closure on the class
	@get: (args) -> # Must be a static method
		_instance ?= new _Singleton_Model args

# The actual Singleton class
class _Singleton_Model
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
		@loadResponse = (budget) ->
			localStorage.setItem budget.virtual_id, JSON.stringify budget

			that.loading = false
			console.log "budget"
			console.log "******"
			console.log budget
			that.cache[budget.virtual_id] = budget
			that.notifyItemLoaded budget
			localStorage.setItem "ob_" + budget.virtual_id, JSON.stringify budget

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
			data = JSON.parse localStorage.getItem "ob_data" + slug
			if data?
				@loadResponse data
			else

#			H.getRecord("/data/hasadna/budget-ninja/" + slug, @loadResponse)
			H.getRecord(slug, @loadResponse)
			@loading = true
		return

	###
	add a listener to this model
	###
	addListener : (list) =>
		@listeners.push list
		return

$.extend
	###
	allow people to create listeners easily
	###
	ModelListener : (list = {}) ->
		$.extend(
			loadBegin : ->
			loadFinish : ->
			loadItem : ->
			loadFail : ->
		,list);
