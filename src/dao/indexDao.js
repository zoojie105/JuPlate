const { pool } = require("../../config/database");


//식당 정보 불러오기
exports.selectRestaurants = async function (connection,category) {
  const selectAllRestaurantsQuery = `SELECT title,address,address2, category, img FROM Restaurants WHERE status = 'A' ;`;
  const selectcategorizedRestaurantsQuery = `SELECT title,address, address2 , category, img FROM Restaurants WHERE status = 'A'  and category = ? ;`;

  const Params =[category];
  const Query = category ? selectcategorizedRestaurantsQuery : selectAllRestaurantsQuery;
  
  const rows = await connection.query(Query,Params);

  return rows;

};


// 학생 CRUD 예제 
exports.deleteStudent =  async function (connection, studentIdx) {
  const Query = `UPDATE Students SET status = "D" WHERE studentIdx = ?`;
  const Params = [studentIdx];

  const [rows] = await connection.query(Query,Params);

  
  if(rows < 1) {
    return false
  }

  return true;
};


exports.isValidStudentIdx =  async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students WHERE studentIdx = ? and status = 'A' `;
  const Params = [studentIdx];

  const [rows] = await connection.query(Query,Params);

  if(rows < 1) {
    return false
  }

  return true;
};


exports.updateStudents =  async function (connection,studentIdx,studentName, major, birth, address) {
  const Query = `UPDATE Students SET 
                        studentName = ifnull(?,studentName), 
                        major = ifnull(?,major), 
                        birth = ifnull(?,birth), 
                        address = ifnull(?,address)
                      WHERE studentIdx = ?`;
  const Params = [studentName, major, birth, address,studentIdx];

  const rows = await connection.query(Query,Params);

  return rows;
};

exports.insertStudents =  async function (connection,studentName, major, birth, address) {
  const Query = `INSERT INTO Students (studentName, major, birth, address) VALUES  (?,?,?,?)`;
  const Params = [studentName, major, birth, address];

  const rows = await connection.query(Query,Params);

  return rows;
};


exports.selectStudents =  async function (connection,studentIdx) {
  const Query = `SELECT * FROM Students where studentIdx = ?; `;
  const Params = [studentIdx];

  const rows = await connection.query(Query,Params);

  return rows;
};


//query string
// exports.selectStudents =  async function (connection,studentName) {
//   const selectAllStudentQuery = `SELECT * FROM Students;`;
//   const selectStudentByNameQuery = `SELECT * FROM Students where studentName = ?; `;
//   const Params = [studentName];

//   let Query = studentName ? selectStudentByNameQuery : selectAllStudentQuery;
//   // if (!studentName) {
//   //   Query = selectAllStudentQuery;
//   // } else {
//   //   Query = selectStudentByNameQuery;
//   // }

//   const rows = await connection.query(Query,Params);

//   return rows;
// };


exports.exampleDao = async function (connection) {
  const Query = `SELECT * FROM Students;`;
  const Params =[];
  
  const rows = await connection.query(Query,Params);

  return rows;
};

