(function() {
  var handle_current_item, hash_changed_handler, load_item, set_active_years, set_current_description, set_current_source, set_current_title, set_loading;
  set_loading = function(is_loading) {};
  set_current_description = function(description) {
    return $("#current-description").html("" + description);
  };
  set_current_source = function(source) {
    return $("#current-source").html("" + source);
  };
  set_current_title = function(title) {
    return $("#current-title").html("" + title);
  };
  set_active_years = function(years) {
    var year, _i, _len, _results;
    $(".year-sel").toggleClass('disabled', true);
    _results = [];
    for (_i = 0, _len = years.length; _i < _len; _i++) {
      year = years[_i];
      _results.push($(".year-sel[rel=" + year + "]").toggleClass('disabled', false));
    }
    return _results;
  };
  handle_current_item = function(data) {
    var year, years;
    set_loading(false);
    set_current_title(data.title);
    set_current_source(data.source);
    set_current_description(data.notes);
    years = (function() {
      var _results;
      _results = [];
      for (year in data.sums) {
        _results.push(year);
      }
      return _results;
    })();
    set_active_years(years);
    update_area_chart("vis-graph", data);
    return update_pie_chart("vis-pie", 2009, data);
  };
  load_item = function(hash) {
    set_loading(true);
    return H.getRecord("/data/hasadna/budget-ninja/" + hash, handle_current_item);
  };
  hash_changed_handler = function() {
    var hash;
    hash = window.location.hash;
    return load_item(hash.slice(1, (hash.length + 1) || 9e9));
  };
  $(function() {
    $(".vis-button").click(function() {
      var rel;
      rel = $(this).attr("rel");
      $(".vis-content").toggleClass("active", false);
      $(rel).toggleClass("active", true);
      $(".vis-button").toggleClass("active", false);
      return $(this).toggleClass("active", true);
    });
    hash_changed_handler();
    return window.onhashchange = hash_changed_handler;
  });
}).call(this);
