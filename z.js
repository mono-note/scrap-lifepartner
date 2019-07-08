const fs = require('fs'),
  cheerio = require('cheerio'),
  he = require('he'),
  request = require('request'),
  rimraf = require('rimraf')

const dist = 'dist/'

const uri =
'https://www.toushikiso.com/indexfund/indexfund-daiwa.html'
const rootPath = 'https://www.toushikiso.com'
const mainPath = '/'+uri.split('/')[uri.split('/').length-2]+'/'
const subPath  = uri.split('/')[uri.split('/').length-1].replace(/\.html/g,'').trim()
const filename = uri.match(/[^\/]+$/)[0]
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}else{
  rimraf.sync(dist);
  fs.mkdir(dist,function(){});
}


let head =[]
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
  head.push({
    title:title,
    keywords:keywords,
    description:description
  })
  $('#pre-next-nav').children().each( function(){
    nav.push(cleanHTML($(this).html()).replace(/←/g,'').replace(/→/g,'').replace(/\n/g,'').replace(/\.\.\//g,'/'));
  })

  doCheerio(cleanHTML($('article').html()))

}
var doCheerio = function (html) {
  const $ = cheerio.load(html);

  // $('nav').remove()

//   <li class="item"><a href="/">ホーム</a></li>
// <li class="item"><a href="/shoken/sbi.html">SBI証券</a></li>
// <li class="item"><a href="/sbi/index.html">SBI証券の初心者取引ガイド</a></li>
// <li class="item"><span>投資信託を売る（売却）</span></li>
  let breadcrumb =''
  let bclen =  $('nav ol').children().length
  $('nav ol').children().each(function(i){
    if(i == 0){}
    else if(i == bclen-1){
      breadcrumb += '<li class="item"><span>' + $(this).html().cleanHTML().replace(/\.\.\//g, '/') + '</span></li>\n'
    }
    else {
      breadcrumb += '<li class="item">' + $(this).html().cleanHTML().replace(/\.\.\//g, '/').replace(/\"index\.html\"/g,'"'+mainPath+'"') + '</li>\n'
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
      if (rootPath + mainPath + $(this).attr('src') == 'https://www.toushikiso.com'+mainPath+'images/yaji.gif') {
        // <div class="next_arrow"><img src="images/yaji.gif"></div>
        const arrow_down = '<figure><img src="/common/img/ico_arrow_down.png" class="icon-cmn" alt="下向き矢印"></figure>'
        $(this).parent().replaceWith(arrow_down);
      }
      else{
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
  writeHTML(cleanHTML(txtbody))

}

let writeHTML = (txtbody = '') => {
  fs.writeFile(filename, txtbody, function (err) {
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
