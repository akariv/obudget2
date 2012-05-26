fs     = require 'fs'
{exec} = require 'child_process'
appFiles  = [
  	'controllers/ControllerClass'
	'controllers/ChartController'
   	'controllers/SearchController'
  	'controllers/TableController'
  	'controllers/VizController'
	'models/Model'
	'utils/mustacheTemplates'
	'utils/utils'
   	'views/LineChartView'
   	'views/PieChartView'
  	'views/TableView'
   	'app'
]
task 'build', 'Build single application file from source files', ->
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile "src/coffee/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'src/coffee/concat.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile -o src/app/js/ -j app.js src/coffee/concat.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        fs.unlink 'src/coffee/concat.coffee', (err) ->
          throw err if err
          console.log 'Done.'