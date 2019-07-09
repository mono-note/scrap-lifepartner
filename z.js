const fs = require('fs'),
  cheerio = require('cheerio'),
  he = require('he'),
  request = require('request'),
  rimraf = require('rimraf'),
  http = require('https')

const dist = 'dist/'
const  htmlDist ='html/'
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}else{
  rimraf.sync(dist);
  fs.mkdir(dist,function(){});
}
if (!fs.existsSync(htmlDist)) {
  fs.mkdirSync(htmlDist);
}else{
  rimraf.sync(htmlDist);
  fs.mkdir(htmlDist,function(){});
}

let urls =[
  'https://www.toushikiso.com/indexfund/indexfund-daiwa.html',
  'https://www.toushikiso.com/indexfund/index-e.html',
  'https://www.toushikiso.com/indexfund/indexfund-daiwa_ifree.html',
  'https://www.toushikiso.com/indexfund/i-mizuho.html',
  'https://www.toushikiso.com/indexfund/indexfund-smt.html',
  'https://www.toushikiso.com/indexfund/indexfund-smam-dc.html',
  'https://www.toushikiso.com/indexfund/indexfund-fundsi.html',
  'https://www.toushikiso.com/indexfund/indexfund-exei.html',
  'https://www.toushikiso.com/indexfund/nissay-indexfund.html',
  'https://www.toushikiso.com/indexfund/indexfund-emaxis.html',
  'https://www.toushikiso.com/indexfund/indexfund-tawara.html',
]

const requestp = require('request-promise');
// const urls = ["http://www.google.com", "http://www.example.com"];
const promises = urls.map(url => requestp(url));

Promise.all(promises).then((data) => {
  data.forEach((valHTML,idx)=>{
      let uri= urls[idx]
      allPath ={}
      allPath.rootPath = 'https://www.toushikiso.com'
      allPath.mainPath = '/' + uri.split('/')[uri.split('/').length - 2] + '/'
      allPath.subPath = uri.split('/')[uri.split('/').length - 1].replace(/\.html/g, '').trim()
      allPath.filename = uri.match(/[^\/]+$/)[0]
      getHead(valHTML,allPath)
  })
});

// urls.forEach((uri) => {

//   // let uri = 'https://www.toushikiso.com/indexfund/indexfund-daiwa.html'
//   allPath ={}
//   allPath.rootPath = 'https://www.toushikiso.com'
//   allPath.mainPath = '/' + uri.split('/')[uri.split('/').length - 2] + '/'
//   allPath.subPath = uri.split('/')[uri.split('/').length - 1].replace(/\.html/g, '').trim()
//   allPath.filename = uri.match(/[^\/]+$/)[0]
//   request(uri, function (error, response, html) {
//     if (!error && response.statusCode == 200) {
//       getHead(html,allPath)
//     }
//   })
// })
var getHead = function(html,path){
  const $ = cheerio.load(html);
  let title = $('title').text();
  let keywords = $('meta[name="keywords"]').attr('content')
  let description = $('meta[name="description"]').attr('content')
  let head =[],nav=[]
  head.push({
    title:title,
    keywords:keywords,
    description:description
  })
  $('#pre-next-nav').children().each( function(){
    nav.push(cleanHTML($(this).html()).replace(/←/g,'').replace(/→/g,'').replace(/\n/g,'').replace(/\.\.\//g,'/'));
  })
  doCheerio(cleanHTML($('article').html()),head,nav,path)

}
var doCheerio = function (html,head,nav,path) {
  const $ = cheerio.load(html);

  let breadcrumb =''
  let bclen =  $('nav ol').children().length
  $('nav ol').children().each(function(i){
    if(i == 0){}
    else if(i == bclen-1){
      breadcrumb += '<li class="item"><span>' + $(this).html().cleanHTML().replace(/\.\.\//g, '/') + '</span></li>\n'
    }
    else {
      breadcrumb += '<li class="item">' + $(this).html().cleanHTML().replace(/\.\.\//g, '/').replace(/\"index\.html\"/g,'"'+path.mainPath+'"') + '</li>\n'
    }
  })
  // let breadcrumb = '<li class="item"><span>'+$('nav ol li').last().text()+'</span></li>'

  $('nav').remove();
  $('.bodyInsert').remove();
  let orderImg = 0
  $('*').each(function () {
    $(this).removeAttr('id')
    if ($(this).is('h1')) {
      $(this).removeAttr('id').removeAttr('class')
      $(this).addClass('ttl-cmn-h1')
    }
    if ($(this).is('table')) {
      $(this).removeAttr('id').removeAttr('class')
      $(this).addClass('table-cmn-01')
      const wraptable1 = '<div class="table-cmn-scroll"></div>'
      const wraptable2 = '<div class="table-cmn-scroll-in"></div>'
      $(this).wrap(wraptable1).wrap(wraptable2)
      $(this).find('tr').removeAttr('class')
      $(this).find('th').removeAttr('class')
      if( $(this).find('td').attr('class') == 'left'){
        $(this).find('td').removeAttr('class')
        $(this).find('td').addClass('ta-l')
      }
      else if( $(this).find('td').attr('class') == 'right'){
        $(this).find('td').removeAttr('class')
        $(this).find('td').addClass('ta-r')
      }

    }
    if($(this).is('a')){
      if($(this).children().length > 0){
      let inTag = $(this).children()
        // if(inTag.attr('class').match(/btn/g).length!=0){
        //   $(this).addClass('btn-cmn-01 link orange')
        //   let txt = inTag.text()
        //   inTag.replaceWith(txt)
        // }
      }
    }
    if ($(this).is('img')) {
      if (path.rootPath + path.mainPath + $(this).attr('src') == 'https://www.toushikiso.com'+path.mainPath+'images/yaji.gif') {
        // <div class="next_arrow"><img src="images/yaji.gif"></div>
        const arrow_down = '<figure><img src="/common/img/ico_arrow_down.png" class="icon-cmn" alt="下向き矢印"></figure>'
        $(this).parent().replaceWith(arrow_down);
      }
      else{
        orderImg++
        // let src =  mainPath+$(this).attr('src').replace(/images\//g,'images/img_')
        let newSRC = path.mainPath + 'images/img_' + path.mainPath.replace(/\//g, '') + '-' + path.subPath + '_' + ("0" + orderImg).slice(-2) + '.'

        src = $(this).attr('src').replace(/([/|.|\w|\s|-])*\./g, newSRC)

        let distImg =  './dist/' + src.match(/([^\/]+$)/g)[0]
        download(path.rootPath + path.mainPath + $(this).attr('src'), distImg, function () {})

        $(this).attr('src', src)
        let img = '<figure>' + $(this) + ' </figure>'
        $(this).parent().replaceWith(img)
      }
    }
  })
  let data = cleanHTML($.html())

  let txt = data.replace(/<html><head><\/head><body>/g,'').replace(/<\/body><\/html>/g,'')
                .replace(/class="font-bold"/g,'class="fw-b"')
                .replace(/class="font-redbold"/g,'class="fw-b txt-red"')
                .replace(/class="headline_sub2"/g,'class="ttl-cmn-h2"')
                .replace(/class="headline_ul"/g,'class="ttl-cmn-h3"')
                .replace(/class="newLine2"/g,'class="mb-15"')
                .replace(/class="font085"/g,'class="txt-sm"')
                .replace(/<strong>/g,'<span class="fw-b">')
                .replace(/<\/strong>/g,'</span>')
                .replace(/\n<\/p/g,'<\/p')
                .replace(/><!--/g,'>\n<!--')
                .replace(/(?=<!--)([\s\S]*?)-->/g,'')
                .replace(/tableC_Ivory/g,'bg-ivory')
                .replace(/\.\.\//g,'/')
                // .replace(/tableC_Ivory/g,'bg-palepink')
                // .replace(/tableC_Ivory/g,'bg-smoke')


  nav =nav.map((v,i)=>{
    if(i==0){
      return '<li class="link prev">'+v+'</li>'
    }else{
      return '<li class="link next">'+v+'</li>'
    }
  })
  // let tbody = head+
  // `\n<!--////////////////////////////////-->\n`+breadcrumb+
  // `\n<!--////////////////////////////////-->\n`+txt+
  // `\n<!--////////////////////////////////-->\n`+nav.join('\n')

  let contents = fs.readFileSync('template.html', 'utf8');

  let txtbody = contents.replace(/<!--TITLE-->/g, head[0].title).replace(/<!--DESC-->/g, head[0].description).replace(/<!--KEYw-->/g, head[0].keywords)
      .replace(/<!--NAVbreadcrumb-->/g, breadcrumb)
      .replace(/<!--CONTENTS-->/g, txt)
      .replace(/<!--NAVIGATOR-->/g, nav.join('\n'))
  writeHTML(cleanHTML(txtbody),path.filename)
  console.log(path.filename);
}


let writeHTML = (txtbody = '',filename) => {
  fs.writeFile(htmlDist+filename, txtbody, function (err) {
    if (err) throw err;
  })
}


String.prototype.cleanHTML = function () {
  return he.decode(this.replace(/\t/g, "").replace(/<br>/g, '<br>\n').replace(/  /g, "").replace(/\n\n/g, '\n'))
};

var cleanHTML = function (str) {
  return (str == null) ? false : he.decode(str.replace(/\t/g, "").replace(/<br>/g, '<br>\n').replace(/  /g, "").replace(/\n\n/g, '\n'))
}
var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    'content-type:',
    res.headers['content-type']
    'content-length:',
    res.headers['content-length']
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
