let fs = require('fs'),
  cheerio = require('cheerio'),
  he = require('he'),
  request = require('request'),
  rimraf = require('rimraf')

let fname = 'index.html'
let dist = 'dist/'

let uri = 'https://www.toushikiso.com/sbi/spoturi.html'
let rootPath = 'https://www.toushikiso.com'
let mainPath = '/sbi/'
let subPath  = 'spoturi'

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}
// fs.readFile(fname, 'utf8', function (err, contents) {
//   doCheerio(contents)
// });

let head =''
let nav =[]
request(uri, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    getHead(html)
  }
})
var getHead = function(html){
  const $ = cheerio.load(html);
  let title = $('title').text();
  let keywords = $('meta[name="keywords"]').attr('content')
  let description = $('meta[name="description"]').attr('content')
  $('#pre-next-nav').children().each( function(){
    nav.push(cleanHTML($(this).html()).replace(/←/g,'').replace(/→/g,'').replace(/\n/g,'').replace(/\.\.\//g,'/'));
  })
  fs.readFile('head.html', 'utf8', function (err, contents) {
    head = contents.replace(/<!--TITLE-->/g,title).replace(/<!--DESC-->/g,description).replace(/<!--KEYw-->/g,keywords);

   doCheerio(cleanHTML($('article').html()))
  });
}
var doCheerio = function (html) {
  const $ = cheerio.load(html);

  // $('nav').remove()

  let breadcrumb = '<li class="item"><span>'+$('nav ol li').last().text()+'</span></li>'
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
      $(this).addClass('table-cmn-01 w-sp-700')
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
      if (rootPath + mainPath + $(this).attr('src') != 'https://www.toushikiso.com/sbi/images/yaji.gif') {
        orderImg++
        // let src =  mainPath+$(this).attr('src').replace(/images\//g,'images/img_')
        let newSRC = mainPath + 'images/img_' + mainPath.replace(/\//g, '') + '-' + subPath + '_' + ("0" + orderImg).slice(-2) + '.'

        src = $(this).attr('src').replace(/([/|.|\w|\s|-])*\./g, newSRC)

        let distImg =  './dist/' + src.match(/([^\/]+$)/g)[0]
        download(rootPath + mainPath + $(this).attr('src'), distImg, function () {})

        $(this).attr('src', src)
        let img = '<figure>' + $(this) + ' </figure>'
        $(this).parent().replaceWith(img)
      }
    }
  })

  let data = cleanHTML($.html())
  let txt = data
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
  let tbody = head+
  `\n<!--////////////////////////////////-->\n`+breadcrumb+
  `\n<!--////////////////////////////////-->\n`+txt+
  `\n<!--////////////////////////////////-->\n`+nav.join('\n')

  writeHTML(cleanHTML(tbody))

}

let writeHTML  =(txtbody='')=>{

  fs.writeFile('output.html', txtbody, function (err) {
    if (err) throw err;
  })
}


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