var cookie = require('cookie-monster');
var times = parseInt(cookie.get('times'), 10) || 0;
cookie.set('times', times + 1);

window.onload = function () {
    document.body.innerHTML += times + ' times';
};
