$.extend
	mustacheTemplates :
		navigator_ancestors : "{{#mus_ancestry}}<a href='/{{mus_url}}' onclick='{{mus_onclick}}'}>{{title}}</a> > {{/mus_ancestry}}"
		navigator_current_section : '<a href="/{{mus_url}}" onclick="return false">{{title}}</a>'
		searchresults : '{{#searchresults}}<a href="/{{title}}" onclick="{{mus_onclick}}">{{title}}</a> <br> {{/searchresults}}'

