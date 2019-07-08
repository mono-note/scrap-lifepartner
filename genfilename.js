const fs = require('fs'),
request = require('request'),
rimraf = require('rimraf')

const  htmlDist ='html'
if (!fs.existsSync(htmlDist)) {
  fs.mkdirSync(htmlDist);
}else{
  rimraf.sync(htmlDist);
  fs.mkdir(htmlDist,function(){});
}

let urllll =[
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


urllll.forEach((v)=>{
  fs.writeFile(htmlDist+'/'+v.match(/[^\/]+$/)[0], '', function (err) {
    if (err) throw err;
  })
})