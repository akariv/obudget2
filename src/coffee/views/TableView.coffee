$.extend
    TableView : ($container, onSubSection)->
        @container = $container
        that = this

        that.onSubSection = onSubSection;

        @setData = (data) ->

            table = null
            tableOptions = $.extend {}, tableDef

            $.extend tableOptions, fnHeaderCallback : (nHead, aData, iStart, iEnd, aiDisplay) ->
	            nHead.getElementsByTagName('th')[0].innerHTML = data.title1
    	        nHead.getElementsByTagName('th')[1].innerHTML = data.title2
            if that.onSubSection?
                $.extend tableOptions, fnCreatedRow : ( nRow, aData, iDataIndex ) ->
                    for cell in $('td', nRow)
                        do (cell) ->  
                            $(cell).html '<a href="">' + $(cell).html() + '</a>' 
                    $(nRow).click (event)->
                        that.onSubSection(aData)
                        return false
                table = $('table', @container).dataTable tableOptions
            else
                table = $('table', @container).dataTable tableOptions

            table.fnClearTable false
            table.fnAddData data.values

        @container.html '
        <table cellpadding="0" cellspacing="0" border="0" class="display">
            <thead>
                <tr>
                    <th>תקציב</th>
                    <th>שנה</th>
                    <th>מזהה</th>
                </tr>
            </thead>
            <tbody>
                <tr class="odd gradeX">
                    <td>1234.0</td>
                    <td>1948</td>
                    <td>0020</td>
                </tr>
            </tbody>
        </table>
        '

        $('table', @container).dataTable(tableDef)
        return


tableDef = {}
tableDef.bDestroy = true

# make the virtual_id column invisible
tableDef.aoColumns = [
    null,
    null,
    "bVisible": false]

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

