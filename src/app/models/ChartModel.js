jQuery.extend({
	ChartModel: function(){
		/**
		 * our local cache  of data
		 */
		var cache = new Array();
		/**
		 * a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();


		/**
		 * load a json response from an
		 * ajax call
		 */
		function loadResponse(data){
			cache[data._src] = data;
			that.notifyItemLoaded(data);
		}

		this.getData = function(slug){
			H.getRecord("/data/hasadna/budget-ninja/" + "00_e4eee3e9f0e4", loadResponse);
		}

		/**
		 * add a listener to this model
		 */
		this.addListener = function(list){
			listeners.push(list);
		}

		/**
		 * tell everyone the item we've loaded
		 */
		this.notifyItemLoaded = function(item){
			$.each(listeners, function(i){
				listeners[i].loadItem(item);
			});
		}

	},

	/**
	 * let people create listeners easily
	 */
	ModelListener: function(list) {
		if(!list) list = {};
		return $.extend({
			loadBegin : function() { },
			loadFinish : function() { },
			loadItem : function() { },
			loadFail : function() { }
		}, list);
	}
});
