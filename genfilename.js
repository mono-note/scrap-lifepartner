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

let uri =[
  'https://www.toushikiso.com/rakuten/rakuten_return.html',
  'https://www.toushikiso.com/rakuten/rakuten-bank.html',
  'https://www.toushikiso.com/rakuten/sell.html',
  'https://www.toushikiso.com/rakuten/shukin.html',
  'https://www.toushikiso.com/rakuten/spotbuy.html',
  'https://www.toushikiso.com/rakuten/tumitatebuy.html',
  'https://www.toushikiso.com/rakuten/kouza.html',
  'https://www.toushikiso.com/rakuten/nyukin.html',
  'https://www.toushikiso.com/rakuten/index.html',
]


uri.forEach((v)=>{
  fs.writeFile(htmlDist+'/'+v.match(/[^\/]+$/)[0], '', function (err) {
    if (err) throw err;
  })
})