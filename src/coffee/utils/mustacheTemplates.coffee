$.extend
	mustacheTemplates :
		navigator_ancestors : "{{#ancestry}}<a href='/{{mus_url}}' onclick=\"History.pushState({vid:'{{virtual_id}}', rand:Math.random()}, '{{title}}', $.titleToUrl('/{{title}}')); return false;\">{{title}}</a> > {{/ancestry}}"
		navigator_current_section : '<a href="/{{mus_url}}" onclick="return false">{{title}}</a>'
