var mysql = require('mysql')

var connection = mysql.createConnection({
    host:"phenome.iptime.org",
    port:"23306",
    user:"choi",
    password:"1518",
    database:"Phenotype"
})

var testQuery = "SELECT * FROM Research";

connection.query(testQuery, function(err, results, fields) {
    if (err) throw err;
    console.log(results);
});