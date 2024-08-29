const { con } = require('../config/db_connection');
// var executeQuery = ()=>{}
if (con) {
	//var executeQuery = (query, params = []) => {
	//	return new Promise((resolve, reject) => {
	//		con.query(query, params, (error, result) => {
	//		if (error) {
	//			reject(error);
	//		} else {
	//			resolve(result);
	//		}
	//		});
	//	});
	//};
	var executeQuery = (query, params = []) => {
		return new Promise((resolve, reject) => {
			con.getConnection((err) => {
				if (err) {
					reject(err);
					return;
				}
			con.query(query, params, (error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				});
			});
		});
	};
}


module.exports = {executeQuery, con};