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
{ id:13, file_name:'folder111',type:0,pid:1 },
{ id:14, file_name:'file111',type:1,pid:13 },
]


var mine={
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

//this should be request itself
//param.res
//param.url

var Handler = {

	resourcesController: function(param){

		//console.log(param.url.query);
		if(this.method.toLowerCase() == 'post'){
			var form = new formidable.IncomingForm();
			form.parse(this, function(err, fields, files){
				console.log(fields);
			});
		}
		else if(this.method.toLowerCase() == 'get'){
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
		}
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

		param.res.end();



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
		//`this`
		Handler[functionName] && Handler[functionName].call(req,{
			res: res,
			url : parsedurl
		})
	}
	else{
		var realPath = path.join("assets", pathname);
		var ext = path.extname(realPath);
		ext = ext ? ext.slice(1) : 'unknown';
		console.log(realPath);
		fs.exists(realPath, function (exists) {
	        if (!exists) {
	            res.writeHead(404, {
	                'Content-Type': 'text/plain',
	                'Access-Control-Allow-Origin':'*'
	            });

	            res.write("This request URL " + pathname + " was not found on this server.");
	            res.end();
	        } else {
	            fs.readFile(realPath, "binary", function (err, file) {
	                if (err) {
	                    res.writeHead(500, {
	                        'Content-Type': 'text/plain',
	                        'Access-Control-Allow-Origin':'*'
	                    });
	                    res.end(err);
	                } else {
	                    var contentType = mine[ext] || "text/plain";
	                    res.writeHead(200, {
	                        'Content-Type': contentType,
	                        'Access-Control-Allow-Origin':'*'
	                    });
	                    res.write(file, "binary");
	                    res.end();
	                }
	            });
	        }
	    });
	}

}).listen(port, "127.0.0.1");

console.log('Server running at http://127.0.0.1:' + port);