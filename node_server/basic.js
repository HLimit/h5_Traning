var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');
var formidable = require("formidable");

var port = 1337;

var fake_file_directory = [
{ id:1, file_name:'folder1',type:0,pid:null },
{ id:2, file_name:'folder2',type:0,pid:null },
{ id:3, file_name:'folder3',type:0,pid:null },
{ id:4, file_name:'file1',type:1,pid:1 },
{ id:5, file_name:'file2',type:1,pid:1 },
{ id:6, file_name:'file3',type:1,pid:2 },
{ id:7, file_name:'file4',type:1,pid:null },
{ id:8, file_name:'file5',type:1,pid:null },
{ id:9, file_name:'file6',type:1,pid:null },
{ id:12, file_name:'file7',type:1,pid:null },
{ id:11, file_name:'file8',type:1,pid:null },
]


//this should be request itself
//param.res
//param.url

var Handler = {
	resourcesController: function(param){

		//console.log(param.url.query);
		var pid = param.url.query ? param.url.query.pid : null;
		if(pid.toLowerCase() == 'null') pid = null;
		param.res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin':'*'
		});
		param.res.end(JSON.stringify(
			fake_file_directory.filter(function(item){
				return (pid == null ? !item.pid : item.pid == pid);
			})
		));
	},

	formPostController: function(param){

		if(this.method.toLowerCase() == 'post'){
			var form = new formidable.IncomingForm();

			form.parse(this, function(err, fields, files){

				console.log(fields);
				console.log(files);

				param.res.writeHead(200, {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin':'*'
				});

				param.res.end(JSON.stringify(
					fields
				));

			})
		}

		param.res.writeHead(200, {
			'Access-Control-Allow-Origin':'*'
		});



	}
}


http.createServer(function (req, res) {

	var parsedurl = url.parse(req.url,true);
	var pathname = parsedurl.pathname;

	if(pathname == '/favicon.ico'){
		return;
	}
	var segments = pathname.split('/').filter(function(seg){
		return seg;
	});

	if(segments.length < 1){
		return;
	}

	console.log(segments[1]+'Controller');

	if(segments[0] == 'api'){
		var functionName = segments[1]+'Controller';
		Handler[functionName] && Handler[functionName].call(req,{
			res: res,
			url : parsedurl
		})
	}
	else{
		return;
	}

}).listen(port, "127.0.0.1");

console.log('Server running at http://127.0.0.1:' + port);