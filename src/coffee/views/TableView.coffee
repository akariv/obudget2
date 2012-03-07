$.extend
	TableView : ($container)->

		this.setData = (data) ->
			$('#example').dataTable().fnClearTable false
			$('#example').dataTable().fnAddData data


		$container.html '
		<table cellpadding="0" cellspacing="0" border="0" class="display" id="example">
			<thead>
				<tr>
					<th>תקציב</th>
					<th>שנה</th>
				</tr>
			</thead>
			<tbody>
				<tr class="odd gradeX">
					<td>אין נתונים</td>
					<td>1948</td>
				</tr>
			</tbody>
		</table>
		'

		$('#example').dataTable()
		return

