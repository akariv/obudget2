class $.Model
	_instance = undefined # Must be declared here to force the closure on the class
	@get: (args) -> # Must be a static method
		_instance ?= new _Singleton_Model args

# The actual Singleton class
class _Singleton_Model
	constructor: (@args) ->
		that = this   #CR: Why is this needed?
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
		@loadResponse = (budget) -> #CR: Why are this defined in the constructor and not as regular methods? Are you familiar with the '=>' operator of coffeescript?
			localStorage.setItem budget.virtual_id, JSON.stringify budget

			that.loading = false
			console.log "budget"
			console.log "******"
			console.log budget
			that.cache[budget.virtual_id] = budget
			that.notifyItemLoaded budget
			localStorage.setItem "ob_" + budget.virtual_id, JSON.stringify budget #CR: Why do you need it twice?

			return

		@loadLocally = (slug, callback) -> #CR: Why didn't you use the 'jsonp' ajax loading method in jQuery?
			h=($ 'head')[0]
			s = document.createElement 'script'
			s.type = 'text/javascript'
			s.src =  "." + slug
			s.addEventListener 'load', (e) ->
				callback window.exports.data
				return
			, false
			window.exports = {}
			h.appendChild s
			return


		###
		tell everyone the item we''ve loaded
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
			data = JSON.parse localStorage.getItem "ob_" + slug #CR: Are you sure that this can't throw an exception?

			if data?
				@loadResponse data
				return

			loadResponse = @loadResponse
			loadLocally = @loadLocally
			# Catch ajax errors when invoking
			H.getRecord "/data/" + slug, (data)->
				if data?
					loadResponse data
				else
					loadLocally "/data/" + slug, loadResponse
				return

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
	ModelListener : (list = {}) -> #CR: I guess that only loadItem is implemented right now?
		$.extend(
			loadBegin : ->
			loadFinish : ->
			loadItem : ->
			loadFail : ->
		,list);
