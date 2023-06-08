const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql2');
// const { use } = require('browser-sync');
// const { rejects } = require('assert');

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.get('/', cors(), (req, res) => {
  res.send('server works');
});

// sometimes works bad and strange, there are just pending statuses on requests
const connection = mysql.createConnection({
  host: 'sql7.freemysqlhosting.net',
  user: 'sql7618544',
  database: 'sql7618544',
  password: 'ba7uTQHGbL'
});

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   database: '*',
//   password: '4248SQL*'
// });

connection.connect(function (err) {
  if (err) {
    return console.log(`There is an error ${err.message}`);
  }
  else {
    console.log('Подключение к серверу MySQL успешно установлено');
  }
})

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.post('/add_class', function (request, response) {
  let requestData = request.body;
  console.log(requestData)
  let sqlIdUserRequest = `select * from users where login = '${requestData.login}'`
  try {
    let result = new Promise(function (resolve, reject) {
      connection.query(sqlIdUserRequest, function (err, results, fields) {
        // console.log(results);
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          answer.result = results;
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    }).catch(err => console.log(err))

    result.then(data => {
      let idUser = data.result[0].idUser
      let sqlRequest = `INSERT INTO classes(classNumber, classLetter, userId) VALUES (${requestData.classNumber}, '${requestData.classLetter}', ${idUser});`
      try {
        let resultInsert = new Promise(function (resolve, reject) {
          connection.query(sqlRequest, function (err, results, fields) {
            // console.log(results);
            answer = {}
            if (err !== null) {
              answer.result = err;
              answer.message = 'something went wrong'
              reject(answer);
            }
            else {
              answer.result = results;
              answer.message = 'everything is fine'
              resolve(answer);
            }
          })
        }).catch(err => console.log(err))

        resultInsert.then(answer => {
          console.log(answer.message)
        })
      }
      catch (error) {
        // console.log(error)
      }
    })

    // result.then(data => data.text()).then(data => console.log(data))
  }
  catch (error) {
    // console.log(error)
  }


  response.end(JSON.stringify('ok'))
})

app.post('/delete_class', function (request, response) {
  let requestData = request.body;
  try {
    let result = new Promise(function (resolve, reject) {
      connection.query(`delete from classes where id=${requestData.id};`,
        function (err, results, fields) {
          // console.log(results);
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            resolve(answer);
          }
        }
      )
    })
    result.then(data => {
      response.end(JSON.stringify(data.result))
    }).catch(error => {
      console.log(error)
    })
    // result.then(data => data.text()).then(data => console.log(data))
  }
  catch (error) {
    // console.log(error)
  }
})

app.post('/get_classes', function (request, response) {
  let user = request.body.login;
  try {
    let sqlRequest = `select classes.id, classes.classNumber, classes.classLetter from classes, 
    users where users.login = '${user}' and classes.userId = users.idUser;`
    let result = new Promise(function (resolve, reject) {
      connection.query(sqlRequest,
        function (err, results, fields) {
          // console.log(results);
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            resolve(answer);
          }
        }
      )
    }).catch(err => console.log(err))
    result.then(data => {
      console.log(data)
      response.end(JSON.stringify(data.result))
    })
    // result.then(data => data.text()).then(data => console.log(data))
  }
  catch (error) {
    // console.log(error)
  }
})

app.post('/add_student', function (request, response) {
  let requestData = request.body;
  if (requestData.studentName == '') {
    requestData.studentName = 'Иван'
  }
  if (requestData.studentSurname == '') {
    requestData.studentSurname = 'Иванов'
  }
  if (requestData.studentLastname == '') {
    requestData.studentLastname = 'Иванович'
  }
  if (requestData.studentBirthDate == '') {
    requestData.studentBirthDate = '11.11.2011'
  }
  if (requestData.studentClass != 'Выберете класс') {
    // console.log(requestData)
    try {
      let result = new Promise(function (resolve, reject) {
        connection.query(`INSERT INTO students(studentName, studentSurname,
        studentLastname, studentBirthDate, studentClass) VALUES ('${requestData.studentName}',
          '${requestData.studentSurname}', '${requestData.studentLastname}',
          '${requestData.studentBirthDate}', ${requestData.studentClass});`,
          function (err, results, fields) {
            // console.log(results);
            answer = {}
            if (err !== null) {
              answer.result = err;
              answer.message = 'something went wrong'
              reject(answer);
            }
            else {
              answer.result = results;
              answer.message = 'everything is fine'
              console.log(answer.result)
              resolve(answer);
            }
          })
      }).then(data => {
        try {
          let resultRequest = new Promise(function (resolve, reject) {
            connection.query(`select * from classes where id = ${requestData.studentClass};`,
              function (err, results, fields) {
                // console.log(results);
                answer = {}
                if (err !== null) {
                  answer.result = err;
                  answer.message = 'something went wrong'
                  reject(answer);
                }
                else {
                  answer.result = results;
                  answer.message = 'everything is fine'
                  resolve(answer);
                }
              })
          })
          resultRequest.catch(err => {
            console.log(err)
          })
          return resultRequest;
        }
        catch (error) {
          console.log(error)
        }
      }).then(data => {
        let dataClass = data.result[0]
        try {
          let resultRequest = new Promise(function (resolve, reject) {
            connection.query(`update students set classLetter = '${dataClass.classLetter}', classNumber = 
            ${dataClass.classNumber}, userId = ${dataClass.userId} where
            studentClass = ${dataClass.id}`,
              function (err, results, fields) {
                // console.log(results);
                answer = {}
                if (err !== null) {
                  answer.result = err;
                  answer.message = 'something went wrong'
                  reject(answer);
                }
                else {
                  answer.result = results;
                  answer.message = 'everything is fine'
                  resolve(answer);
                }
              })
          })
          resultRequest.catch(err => {
            console.log(err)
          })
          return resultRequest;
        }
        catch (error) {
          console.log(error)
        }
      }).then(result => {
        console.log(result)
      })
    }
    catch (error) {
      console.log(error)
    }
  }



  response.end(JSON.stringify('ok'))
})

app.post('/get_student', function (request, response) {
  let requestData = request.body

  let sqlIdUserRequest = `select * from users where login = '${requestData.login}'`
  try {
    let result = new Promise(function (resolve, reject) {
      connection.query(sqlIdUserRequest, function (err, results, fields) {
        // console.log(results);
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          answer.result = results;
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    }).catch(err => console.log(err))

    result.then(data => {
      let idUser = data.result[0].idUser

      let requestSQL = {
        string: `select * from students `,
        name: false,
        surname: false,
        lastname: false,
        class: false
      }
      if (requestData.studentName !== '') {
        requestSQL.name = true;
      }
      if (requestData.studentSurname !== '') {
        requestSQL.surname = true;
        requestSQL.string += ` where studentSurname like '%${requestData.studentSurname}%' `
      }
      if (requestData.studentLastname !== '') {
        requestSQL.lastname = true;
        requestSQL.string += `${requestSQL.surname ? 'and' : 'where'} studentLastname like '%${requestData.studentLastname}%' `
      }
      if (requestData.studentClass !== 'Выберете класс') {
        requestSQL.class = true;
        requestSQL.string += `${requestSQL.surname || requestSQL.lastname ? 'and' : 'where'} studentClass like '${requestData.studentClass}' `
      }
      if (requestSQL.name) {
        requestSQL.string += `${requestSQL.surname || requestSQL.lastname || requestSQL.class ? 'and' : 'where'} studentName like '%${requestData.studentName}%' `
      }
      requestSQL.string += `and userId = ${idUser};`;
      console.log(requestSQL)
      try {
        let result = new Promise(function (resolve, reject) {
          connection.query(requestSQL.string,
            function (err, results, fields) {
              // console.log(results);
              answer = {}
              if (err !== null) {
                answer.result = err;
                answer.message = 'something went wrong'
                console.log(err)
                reject(answer);
              }
              else {
                answer.result = results;
                answer.message = 'everything is fine'
                let resultCLasses = new Promise(function (resolve, reject) {
                  connection.query(`SELECT id, classNumber, classLetter FROM classes;`,
                    function (errClass, resultsClass, field) {
                      if (errClass) {
                        reject(errClass)
                      }
                      else {
                        answer.result.forEach(element => {
                          let objClass = resultsClass.find(elClass => elClass.id === element.studentClass)
                          element.studentClass = objClass.classNumber + objClass.classLetter
                        });
                        resolve()
                      }
                    })
                })
                resultCLasses.then(data => {
                  response.send(JSON.stringify(answer.result))
                })
                resolve(answer);
              }
            })
        })
      }
      catch (error) {
        console.log(error)
      }
    })
  }
  catch (err) {
    console.log(err)
  }


})

app.post('/delete_student', function (request, response) {
  let requestData = request.body;
  try {
    let result = new Promise(function (resolve, reject) {
      connection.query(`delete from students where id=${requestData.id};`,
        function (err, results, fields) {
          // console.log(results);
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            resolve(answer);
          }
        }
      )
    })
    result.then(data => {
      console.log(data.result)
      response.end(JSON.stringify(data.result))
    }).catch(error => {
      console.log(error)
    })
  }
  catch (err) {
    console.log(err)
  }
})

app.post('/all_students', function (request, response) {
  console.log('attemtp to send users list')
  let requestData = request.body;
  let sqlIdUserRequest = `select * from users where login = '${requestData.login}'`
  try {
    let resultLogin = new Promise(function (resolve, reject) {
      connection.query(sqlIdUserRequest, function (err, results, fields) {
        // console.log(results);
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          answer.result = results;
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    }).catch(err => console.log(err))

    resultLogin.then(data => {
      let idUser = data.result[0].idUser
      let result = new Promise(function (resolve, reject) {
        connection.query(`select * from students where userId = ${idUser}`,
          function (err, results, fields) {
            // console.log(results);
            answer = {}
            if (err !== null) {
              answer.result = err;
              answer.message = 'something went wrong'
              reject(answer);
            }
            else {
              answer.result = results;
              answer.message = 'everything is fine'

              let resultClasses = new Promise(function (resolve, reject) {
                connection.query(`SELECT id, classNumber, classLetter FROM classes where userId = ${idUser};`,
                  function (errClass, resultsClass, field) {
                    if (errClass) {
                      reject(errClass)
                    }
                    else {
                      answer.result.forEach(element => {
                        let objClass = resultsClass.find(elClass => elClass.id === element.studentClass)
                        element.studentClass = objClass.classNumber + objClass.classLetter
                      });
                      resolve()
                    }
                  })
              })
              resultClasses.then(data => {
                response.end(JSON.stringify(answer.result))
              }).catch(error => {
                console.log(error)
              })
              resolve(answer);
            }
          }
        )
      }).catch(err => console.log(err))

      result.then(data => console.log(data))
    })


  }
  catch (err) {
    console.log(err)
  }
})

// let studentId = 1
// app.post('/save_id_student', function (request, response) {
//   studentId = request.body.id
//   console.log(studentId)
//   response.end(JSON.stringify(studentId))
// })

app.post('/get_student_by_id', function (request, response) {
  let studentId = request.body.studentId
  // console.log(request.body)
  let requestSQL = `select * from students where id = ${studentId}`
  try {
    let resultStudentData = new Promise(function (resolve, reject) {
      connection.query(requestSQL,
        function (err, results, fields) {
          // console.log(results);
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            console.log(err)
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            // console.log(requestSQL)
            // console.log(answer.result)
            resolve(answer);
          }
        })
    })

    resultStudentData.then(answer => {
      let resultPollsStudent = new Promise(function (resolve, reject) {
        let answerPolls = {}
        answerPolls.resultStudent = answer.result
        let requestPollsSQL = `select * from polls where idStudent = ${studentId}`
        connection.query(requestPollsSQL,
          function (err, results, fields) {
            // console.log(results);
            if (err !== null) {
              answerPolls.result = err;
              answerPolls.message = 'something went wrong'
              console.log(err)
              reject(answerPolls);
            }
            else {
              answerPolls.resultPolls = results;
              answerPolls.message = 'everything is fine'

              function formatDate(dateString) {
                let date = new Date(dateString);
                const isoString = date.toISOString();

                let dateComponent = isoString;
                dateComponent = dateComponent.slice(0, -1) + '0Z';
                date = new Date(dateComponent);
                date = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                date = date.toISOString();
                const parts = date.split('T');

                date = parts[0];
                return dateComponent;
              }
              answerPolls.resultPolls.forEach((el, index) => {
                answerPolls.resultPolls[index].date = formatDate(el.date)
                console.log()
              })

              answerPolls.resultPolls.sort((a, b) => a - b)
              let lengthPolls = answerPolls.resultPolls.length
              answerPolls.resultPolls = answerPolls.resultPolls[lengthPolls - 1]
              console.log(answerPolls)
              resolve(answerPolls);
            }
          })
      }).catch(err => console.log(err))

      let resultAnswers = resultPollsStudent.then(answerPolls => {
        // console.log(answerPolls)
        let studentAnswers = answerPolls
        if (answerPolls.resultPolls == undefined) {
          return studentAnswers
        }
        return new Promise(function (resolve, reject) {
          let studentAnswers = answerPolls

          let requestPollsSQL = `select * from answers where idPoll = ${answerPolls.resultPolls.idPoll};`
          connection.query(requestPollsSQL,
            function (err, results, fields) {
              // console.log(results);
              if (err !== null) {
                studentAnswers.result = err;
                studentAnswers.message = 'something went wrong'
                console.log(err)
                reject(studentAnswers);
              }
              else {
                studentAnswers.resultAnswers = results;
                studentAnswers.message = 'everything is fine'
                resolve(studentAnswers);
              }
            })
        }).catch(err => console.log(err))
      })

      let resultAddQuestions = resultAnswers.then(studentAnswers => {
        if (studentAnswers.resultAnswers == undefined) {
          return studentAnswers
        }
        return new Promise(function (resolve, reject) {
          let studentAnswersUpdated = studentAnswers
          studentAnswersUpdated.resultAnswers.forEach((el, index) => {
            let requestPollsSQL = `select text from questions where idQuestion = ${el.idQuestion};`
            connection.query(requestPollsSQL,
              function (err, results, fields) {
                // console.log(results);
                if (err !== null) {
                  studentAnswersUpdated.result = err;
                  studentAnswersUpdated.message = 'something went wrong'
                  console.log(err)
                  reject(studentAnswersUpdated);
                }
                else {
                  studentAnswersUpdated.resultAnswers[index].text = results[0].text;
                  // console.log(results[0])
                  // console.log(studentAnswersUpdated)
                }
              })
          })
          resolve(studentAnswersUpdated)
        }).catch(err => console.log(err))
      })

      resultAddQuestions.then(result => {
        // console.log(result)
        response.end(JSON.stringify(result))
      })

    })
  }

  catch (error) {
    console.log(error)
  }
})

// Route to handle the incoming request
app.post("/update_student", (req, res) => {
  // Get the data from the request body
  const { studentName, studentSurname, studentLastname, studentBirthDate, studentClassNumber, studentClassLetter, studentId } = req.body;

  // Construct the SQL query to update the student's record in the database
  function updateStudent() {
    let resultGettingClass = new Promise(function (resolve, reject) {
      connection.query(`select id from classes where classLetter = '${studentClassLetter}' and classNumber = ${studentClassNumber}`, function (err, results, fields) {
        // console.log(results);
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          console.log(err)
          reject(answer);
        }
        else {
          answer.result = results;
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    })
    resultGettingClass.then(data => {
      let idClass = data.result[0].id
      const query = `UPDATE students SET studentClass = ${idClass}, studentName = '${studentName}', studentSurname = '${studentSurname}', studentLastname = '${studentLastname}', studentBirthDate = '${studentBirthDate}', classNumber = ${studentClassNumber}, classLetter = '${studentClassLetter}' WHERE id = ${studentId}`;
      // let queryUpdate = new Promise((resolve, reject) => {
      // Execute the SQL query
      connection.query(query, (error, results) => {
        if (error) {
          // Handle the error
          console.error(error);
          res.status(500).send("Error updating student record");
        } else {
          // console.log(results)
          // Send a success response
          res.send("Student record updated successfully");
        }
      });
    })
  }
  // })

  // queryUpdate.then(() => console.log('before'))
  const queryCheckClassId = `SELECT id FROM classes WHERE classNumber = ${studentClassNumber} AND classLetter = '${studentClassLetter}'`;
  connection.query(queryCheckClassId, (error, results) => {
    if (error) {
      console.log(error)
    }
    else {
      if (results.length === 0) {
        let result = new Promise(function (resolve, reject) {
          connection.query(`INSERT INTO classes(classNumber, classLetter) VALUES (${studentClassNumber}, '${studentClassLetter}');`, function (err, results, fields) {
            // console.log(results);
            answer = {}
            if (err !== null) {
              answer.result = err;
              answer.message = 'something went wrong'
              reject(answer);
            }
            else {
              answer.result = results;
              answer.message = 'everything is fine'
              resolve(answer);
            }
          })
        })
        result.then(data => {
          console.log(data)
        })
        updateStudent()
      }
      else {
        updateStudent()
      }
    }
  })

});

app.post('/save_monitoring', (request, response) => {
  let requestData = request.body
  // console.log(requestData.date + ' date')
  let result = new Promise((resolve, reject) => {
    connection.query(`select * from polls where date ='${requestData.date}' and type = ${requestData.type}`, function (err, results, fields) {
      answer = {}
      if (err !== null) {
        answer.result = err;
        answer.message = 'something went wrong'
        reject(answer);
      }
      else {
        answer.result = results;
        answer.message = 'everything is fine'
        resolve(answer);
      }
    })
  }).catch(err => console.log(err))

  result.then(data => {
    if (data.result[0] == undefined) {
      try {
        makeDateCreateRequest().then(data => {
          response.end(JSON.stringify(data))
        }).catch(err => console.log(err))
      }
      catch (err) {
        console.log(err)
      }
    }
    else {
      response.end(JSON.stringify(data))
    }
  })

  function makeDateCreateRequest() {
    return new Promise((resolve, reject) => {
      connection.query(`insert into polls(idStudent, date, type) values(${requestData.studentId}, '${requestData.date}', ${requestData.type});`, function (err, results, fields) {
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          answer.result = results;
          console.log(results)
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    }).catch(err => console.log(err))
  }
})

// app.post('/save_monitoring_type', (request, response) => {
//   let requestData = request.body
//   let sqlRequest = `update polls set type = ${requestData.type} where idStudent = ${requestData.studentId} and 
//   date = '${requestData.datePoll}'`
//   console.log(sqlRequest)
//   let result = new Promise((resolve, reject) => {
//     connection.query(sqlRequest, function (err, results, fields) {
//       answer = {}
//       if (err !== null) {
//         answer.result = err;
//         answer.message = 'something went wrong'
//         reject(answer);
//       }
//       else {
//         answer.result = results;
//         answer.message = 'everything is fine'
//         resolve(answer);
//       }
//     })
//   }).catch(err => console.log(err))

//   result.then(answer => {
//     console.log(answer)
//   })
// })

app.post('/save_radio', (request, response) => {
  console.log('save radio')
  let requestData = request.body

  let resultQuestions = new Promise((resolve, reject) => {
    connection.query(`select * from questions where text like ('${requestData.itemText.text.slice(0, 50)}%');`, function (err, results, fields) {
      answer = {}
      if (err !== null) {
        answer.result = err;
        answer.message = 'something went wrong'
        reject(answer);
      }
      else {
        answer.result = results;
        answer.message = 'everything is fine'
        resolve(answer);
      }
    })
  }).catch(err => console.log(err))

  //получение id теста (Poll) для последующего запроса на создание записи answer
  let resultPoll = resultQuestions.then(dataQuestion => {
    console.log(requestData.addition)
    return new Promise((resolve, reject) => {
      connection.query(`select * from polls where date = '${requestData.datePoll}';`, function (err, results, fields) {
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          try {
            answer.result = results;
            answer.dataQuestion = dataQuestion.result
            answer.message = 'everything is fine'
            resolve(answer);
          }
          catch (err) {
            console.log(err)
          }
        }
      })
    })
  }).catch(err => console.log(err))

  //проверка на уже существующий answer
  let resultCheck = resultPoll.then(data => {
    let idPoll = data.result[0].idPoll
    let idQuestion = data.dataQuestion[0].idQuestion
    let idMethod = data.dataQuestion[0].idMethod
    let answerPoints = requestData.data
    let addition = requestData.addition
    return new Promise((resolve, reject) => {
      connection.query(`select * from answers where idPoll = ${idPoll} and idQuestion = ${idQuestion}`, function (err, results, fields) {
        answer = {}
        if (err !== null) {
          answer.result = err;
          answer.message = 'something went wrong'
          reject(answer);
        }
        else {
          if (results[0] == undefined) {
            answer.resultOfCheck = false
          }
          else {
            answer.resultOfCheck = true;
          }
          // переопределение переменных для дальнейшего использования в insert запросе
          answer.idPoll = idPoll
          answer.idQuestion = idQuestion
          answer.idMethod = idMethod
          answer.answerPoints = answerPoints
          answer.addition = addition
          answer.message = 'everything is fine'
          resolve(answer);
        }
      })
    })
  }).catch(err => console.log(err))

  let resultInsertAnswer = resultCheck.then(data => {
    if (!data.resultOfCheck) {
      return new Promise((resolve, reject) => {
        let querySql = `insert into answers(idPoll, answerPoints, idQuestion, idMethod) values(
          ${data.idPoll}, ${data.answerPoints}, ${data.idQuestion}, ${data.idMethod}
        );`
        let additionCheck = data.addition == undefined
        let querySqlWithAddition = ''
        if (!additionCheck) {
          querySqlWithAddition = `insert into answers(idPoll, answerPoints, addition ,idQuestion, idMethod) values(
            ${data.idPoll}, ${data.answerPoints}, '${data.addition}',${data.idQuestion}, ${data.idMethod}
          );`
        }
        connection.query(additionCheck ? querySql : querySqlWithAddition, function (err, results, fields) {
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            resolve(answer);
          }
        })
      })
    }
    else {
      return new Promise((resolve, reject) => {
        let querySql = `update answers set answerPoints = ${data.answerPoints}
        where idPoll = ${data.idPoll} and idQuestion = ${data.idQuestion};`
        let additionCheck = data.addition == undefined
        let querySqlWithAddition = ''
        if (!additionCheck) {
          querySqlWithAddition = `update answers set answerPoints = ${data.answerPoints}, addition = '${data.addition}'
          where idPoll = ${data.idPoll} and idQuestion = ${data.idQuestion};`
        }
        connection.query(additionCheck ? querySql : querySqlWithAddition, function (err, results, fields) {
          answer = {}
          if (err !== null) {
            answer.result = err;
            answer.message = 'something went wrong'
            reject(answer);
          }
          else {
            answer.result = results;
            answer.message = 'everything is fine'
            resolve(answer);
          }
        })
      })
    }

  }).catch(err => console.log(err))

  resultInsertAnswer.then(dataFinal => {
    console.log(dataFinal)
  })
})

app.post('/sign_in_data', (request, response) => {
  let requestData = request.body
  let sqlRequestText = `select * from users where login = '${requestData.login} '
  and password = '${requestData.password}'`

  let existenceCheck = new Promise((resolve, reject) => {
    connection.query(sqlRequestText, function (err, results, fields) {
      answer = {}
      if (err !== null) {
        answer.result = err;
        answer.message = 'something went wrong'
        reject(answer);
      }
      else {
        answer.result = results;
        answer.message = 'everything is fine'
        resolve(answer);
      }
    })
  }).catch(err => {
    console.log(err)
  })

  existenceCheck.then(user => {
    if (user.result[0] == undefined) {
      console.log('incorrect data')
      let answer = {
        message: 'incorrect data'
      }
      response.end(JSON.stringify(answer))
    }
    else {
      console.log('successful login')
      let answer = {
        message: 'successful login'
      }
      response.end(JSON.stringify(answer))
    }
  })
})

app.post('/sign_up_data', (request, response) => {
  let requestData = request.body
  let sqlRequestText = `select * from users where login = '${requestData.login} '
  `

  let existenceCheck = new Promise((resolve, reject) => {
    connection.query(sqlRequestText, function (err, results, fields) {
      answer = {}
      if (err !== null) {
        answer.result = err;
        answer.message = 'something went wrong'
        reject(answer);
      }
      else {
        answer.result = results;
        answer.message = 'everything is fine'
        resolve(answer);
      }
    })
  }).catch(err => {
    console.log(err)
  })

  existenceCheck.then(user => {
    if (user.result[0] == undefined) {
      return true
    }
    else {
      console.log('account is already taken')
      let answer = {
        message: 'account is already taken'
      }
      response.end(JSON.stringify(answer))
      return false
    }
  })

    .then((result) => {
      if (result) {
        let createUser = new Promise((resolve, reject) => {
          let sqlRequestText = `insert into users(login, 
        password) values('${requestData.login}', '${requestData.password}');`
          connection.query(sqlRequestText, function (err, results, fields) {
            answer = {}
            if (err !== null) {
              answer.result = err;
              answer.message = 'something went wrong'
              reject(answer);
            }
            else {
              answer.result = results;
              answer.message = 'everything is fine'
              resolve(answer);
            }
          })
        }).catch(err => {
          console.log(err)
        })

        createUser.then(result => {
          let answer = {
            message: 'successful registration'
          }
          console.log('successful registration')
          response.end(JSON.stringify(answer))
        })
      }
    })
})

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

