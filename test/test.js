
// example usage: reading epubs in your browser

var http = require('http');
var fs = require('fs');
var mime = require('mime');

var epub2web = require('../index.js');
var port = 8124;
var cacheDir = __dirname+'/../www/cache';
var epubDir = __dirname+'/epubs';

// attach to any cache dir you want for cache location of exploded epubs

epub2web.attach(cacheDir);

// your server will be much more sophisticated than this, of course ...

var server = http.createServer(function (req,res) {

	var urlparts;

	if(req.url=='/') {

		    res.writeHead(200, ['Content-Type', 'text/html']);
		    res.write('<p>Append an epub filename onto the /read/ URL ');
		    res.end('to read the file! (try <a href="http://'+req.headers.host+'/read/testbook.epub">the test file</a> for starters)');

	} else if (urlparts = req.url.match(/\/cache\/([^\/]+?)\/?$/)) { /* get from cacheId */

			epub2web.reader(
				urlparts[1],
				'read', /* template name for reading system */
				function (err, cacheId, htmlApp) { /* callback after webify complete */

					// the htmlApp is the whole reading system,
					// fully configured for this cacheId, so
					// just pass it right to the browser

					res.writeHead(200, ['Content-Type', 'text/html']);
					res.end(htmlApp);

				});


	} else if (urlparts = req.url.match(/\/cache\/([^\/]+?)\/(.+?)$/)) { /* get file from cache */



			var cid = urlparts[1];
			
			var filename = cacheDir +'/'+urlparts[1]+'/'+urlparts[2];

			var realpath = fs.realpathSync(filename);

			var stat = fs.statSync(realpath);

			res.writeHead(200, {
				'Content-Type': mime.lookup(filename),
				'Content-Length': stat.size
			});

		    res.end(fs.readFileSync(filename));




	} else if (urlparts = req.url.match(/\/read\/(.+?\.epub)(.*?)$/)) { /* get from epub filename */


			epub2web.webify(
				epubDir+'/'+urlparts[1], /* full path of epub file */
				'read', /* template name for reading system */
				function (err, cacheId, htmlApp) { /* callback after webify complete */

					// the htmlApp is the whole reading system,
					// fully configured for this cacheId, so
					// just pass it right to the browser

					var cacheurl = '/cache/'+cacheId+'/';

					res.writeHead(302, {
						'Location': cacheurl
					});
					res.end();

//					res.writeHead(200, ['Content-Type', 'text/html']);
//					res.end(htmlApp);

				});

	}
});

console.log('server created - go to http://localhost:'+port+'/ to start');


server.listen( port );