$.extend
	TableView : ($container, onSubSection)->
		@container = $container
		that = this

		that.onSubSection = onSubSection;

		@setData = (data) ->
			$('table', @container).dataTable().fnClearTable false
			table = $('table', @container).dataTable()
			table.fnAddData data
			# open sub section of the budget.
			if that.onSubSection?
				table.$('td').on( "click",
					name : "benny",
					(a)->
						console.log a
						that.onSubSection()
						#table.fnFilter this.innerHTML
						return)
			return

		@container.html '
		<table cellpadding="0" cellspacing="0" border="0" class="display">
			<thead>
				<tr>
					<th>תקציב</th>
					<th>שנה</th>
				</tr>
			</thead>
			<tbody>
				<tr class="odd gradeX">
					<td>1234.0</td>
					<td>1948</td>
				</tr>
			</tbody>
		</table>
		'

		$('table', @container).dataTable(tableDef)
		return


tableDef = {}
#    tableDef.aoColumns = [
#      .
#      .
#      .
#    ];
# Make GUI hebrew
tableDef.oLanguage =
	"sProcessing":   "מעבד..."
	"sLengthMenu":   "הצג _MENU_ פריטים"
	"sZeroRecords":  "לא נמצאו רשומות מתאימות"
	"sInfo": "_START_ עד _END_ מתוך _TOTAL_ רשומות"
	"sInfoEmpty":    "0 עד 0 מתוך 0 רשומות"
	"sInfoFiltered": "(מסונן מסך _MAX_  רשומות)"
	"sInfoPostFix":  ""
	"sSearch":       "חפש:"
	"sUrl":          ""
	"oPaginate":
		"sFirst":    "ראשון",
		"sPrevious": "קודם",
		"sNext":     "הבא",
		"sLast":     "אחרון"

