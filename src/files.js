const fs = require('fs')
function readFile(path){
    const data = fs.readFileSync(path);
    const libros = JSON.parse(data).libros;
    return libros;
}

function writeFile(path, info){
    const data = JSON.stringify({'libros': info});
    fs.writeFileSync(path, data);
}

module.exports = {
    readFile,
    writeFile
}