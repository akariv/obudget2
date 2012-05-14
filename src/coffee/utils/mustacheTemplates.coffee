$.extend
	mustacheTemplates :
		navigator_ancestors : "{{#ancestry}}<a href='/{{mus_url}}' onclick='{{mus_onclick}}'}>{{title}}</a> > {{/ancestry}}"
		navigator_current_section : '<a href="/{{mus_url}}" onclick="return false">{{title}}</a>'
		searchresults : '{{#searchresults}}<a href="/{{title}}" onclick="{{mus_onclick}}">{{title}}</a> <br> {{/searchresults}}'

