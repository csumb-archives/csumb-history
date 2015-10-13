var fs = require('fs'),
    path = require('path'),
    walk = require('walk'),
    _ = require('underscore'),
    cheerio = require('cheerio'),
    tidy = require('htmltidy').tidy;
var format = ['---',
  'layout: history',
  'title: {{title}}',
  '---',
  '<div id="article">',
  '<div class="row">',
  '<div class="col-md-8" id="history-archive-content">',
  '{{content}}',
  '</div>',
  '<div class="col-md-3" id="history-archive-navigation">',
  '{{navigation}}',
  '</div>',
  '</div>',
  '</div>'].join("\n");
  var page = {};
  var walker = walk.walk('old', { followLinks : false });
  walker.on("file", function(root, fileStat, next) {
    if(fileStat.name.search('.html') > -1) {
      fs.readFile(path.resolve(root, fileStat.name), function (err, data) {
        if(!err) {
          tidy(data, function(err, html) {
            $ = cheerio.load(html);
            var title = $('h1.title').first().html();
            if(title) {
              title = title.replace(/:/g, '&#58;').replace(/\//g, ' ').replace(/~/g, '-').replace(/\n/g, ' ').replace(/-/g, '').trim();
            }

            $('#content img').remove();
            page = {
              title : title,
              content : $('#content').first().html(),
              navigation: $('#book-block-menu-').first().html()
            };
            if(page.content) {
              pageString = format;
              _.each(page, function(value, index) {
                pageString = pageString.replace('{{' + index + '}}', value);
              });
              fs.writeFile(path.resolve(root, fileStat.name), pageString, function(err) {
                console.log(path.resolve(root, fileStat.name));
              });

            }
          });
        }
      });
    }
    next();
  });
