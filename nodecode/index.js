var http = require("http");
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var app = express();
var busboy = require('connect-busboy');
//var unzip = require("unzip");
var child_process = require('child_process');


app.set("view engine", "ejs");
app.set('views', __dirname + '/views');

//var homeDir = "E:\\git\\oschina\\PhantomJS\\";

var homeDir = process.env["fs_browser_root"] || "/";
var port = process.env["fs_browser_port"] || 8899;

console.info(homeDir);

app.use(express.static(homeDir, {
	index: false
}));
app.use(busboy());

function timeTostr(tm) {
	return tm.getFullYear() + "-" + (tm.getMonth() + 1) + "-" + tm.getDate() +
		" " + tm.getHours() + ":" + tm.getMinutes();
}

function manSize(size) {
	if (size >= 1024 * 1024 * 1024) {
		return (size / (1024 * 1024 * 1024)).toFixed(2) + "G";
	}
	if (size >= 1024 * 1024) {
		return (size / (1024 * 1024)).toFixed(2) + "M";
	}
	if (size >= 1024) {
		return (size / (1024)).toFixed(2) + "K";
	}
	return size + "B";
}

app.get("/favicon.ico", function(req, res) {
	res.status(404).send("Not found!");
});

app.post("*", function(req, res) {
	console.info("POST:", req.path);
	if (req.path[req.path.length - 1] !== '/') {
		res.redirect(req.path + "/");
		return;
	}
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function(fieldname, file, filename) {
		console.log("Uploading: " + filename);
		if (filename) {
			fstream = fs.createWriteStream(homeDir + decodeURIComponent(req.path) + filename);
			file.pipe(fstream);
			fstream.on('close', function() {
				res.redirect(req.path);
			});
		} else {
			res.redirect(req.path);
		}

	});

	//res.redirect(req.path);
});

app.get("/__geturl", function(req, res) {
	var url64 = req.query.url64;
	var url;
	if (url64) {
		var s = new Buffer(url64, 'base64');
		url = s.toString();
	}
	url = url || req.query.url;
	if (!url) {
		res.send("/__geturl?url=http://www.baidu.com/   or /__geturl?url64=aHR0cDovL3d3dy5iYWlkdS5jb20v");
		return;
	}
	console.info(url);
	//res.send(url);
	var r = require('request');
	r(url).on('error', function(e) {
		res.status(500).send(e);
	}).pipe(res);
	return;
});

app.get("*", function(req, res) {
	console.info("GET:", req.path);
	if (req.path[req.path.length - 1] !== '/') {
		res.redirect(req.path + "/");
		return;
	}
	res.header("Access-Control-Allow-Origin", "*");
	var localPath = decodeURIComponent(req.path);
	var path = homeDir + localPath;
	if (fs.existsSync(path)) {
		if (req.query.cmd === "rename") {
			console.info("rename:", req.query.oldfn, req.query.newfn);
			fs.renameSync(path + req.query.oldfn, path + req.query.newfn);
			res.send("ok");
			return;
		}
		if (req.query.cmd === "delete") {
			console.info("Delete:", req.query.filename);
			fs.unlink(path + req.query.filename, function(err) {
				if (err) {
					res.send(err);
					return;
				}
				res.send("ok");
				return "ok";
			});
			return;
		}

		if (req.query.cmd === "newdir") {
			console.info("Create:", req.query.newdir);
			fs.mkdir(path + req.query.newdir, function(err) {
				if (err) {
					res.send(err);
					return;
				}
				res.send("ok");
				return;
			});
			return;
		}

		if (req.query.cmd === "deletepath") {
			console.info("deletepath:", req.query.filename);
			fs.rmdir(path + req.query.filename, function(err) {
				if (err) {
					res.send(err);
					return;
				}
				res.send("ok");
				return "ok";
			});
			return;
		}

		if (req.query.cmd === "run") {
			try {
				console.info("run:", req.query.filename);
				var fullPath = path + req.query.filename;
				child_process.execFile(fullPath, null, function(err, result) {
					console.log(result);
				});
				res.send("ok");
			} catch (e) {
				console.log(e);
				res.send(e.toString());
			}

			return;
		}

		// if (req.query.cmd === "unzip") {
		// 	console.info("unzip:", req.query.filename);

		// 	fs.createReadStream(path + req.query.filename).pipe(unzip.Extract({
		// 		path: path
		// 	}).on("error", function(err) {
		// 		res.send(err);
		// 	}).on("close", function() {
		// 		res.send("ok");
		// 	}));

		// 	return;
		// }


		var fns = fs.readdirSync(path);
		var files = [];
		var paths = [];
		if (req.path !== '/') {
			paths.push({
				name: "..",
				time: ""
			});
		}
		fns.forEach(function(fn) {
			try {
				var fullName = path + fn;
				var stats = fs.statSync(fullName);
				// console.info(fn);
				// console.info(stats);
				if (stats.isFile()) {
					files.push({
						name: fn,
						time: timeTostr(stats.ctime),
						size: manSize(stats.size)
					});
				} else {
					paths.push({
						time: timeTostr(stats.ctime),
						name: fn,
						size: 0
					});
				}
			} catch (e) {
				console.log(e, fn);
			}

		});
		res.render('index', {
			files: files,
			paths: paths,
			curPath: localPath
		});
		//res.send(fns);
	} else {
		res.status(404).send("Not Fount:" + req.path + "<br /><a href='/'>Go Home</a>");
	}

});



// 创建服务端
http.createServer(app).listen(port, function() {
	console.log('start server ok,port=', port);
	console.log("homeDir:", homeDir);
});