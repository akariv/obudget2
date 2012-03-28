$.extend
	TableView : ($container)->

		@container = $container
		that = this

		@setData = (data) ->
			$('table', @container).dataTable().fnClearTable false
			$('table', @container).dataTable().fnAddData data


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

		$('table', @container).dataTable()
		return

