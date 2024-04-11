const moment = require('moment');

function addCreatedAt(req, res, next) {
    // Obtener la fecha y hora actual en el formato deseado
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm');

    // Agregar el campo created_at al cuerpo de la solicitud si aún no existe
    if (!req.body.created_at) {
        req.body.created_at = currentDateTime;
    }

    // Llamar a la siguiente función en la cadena de middleware
    next();
}

module.exports = addCreatedAt;