const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sqlite3 = require('sqlite3');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const db = new sqlite3.Database('./db/sqlite.db');

app.get('/studentName', function(req, res) {
    var studentId = req.query.studentId;
    db.get("SELECT name FROM Student WHERE s_id = ?", [studentId], function(err, row) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (row) {
                res.send({message: row.name + "歡迎註冊", name: row.name});
            } else {
                res.send({message: "No student found"});
            }
        }
    });
});

// 使用 req 參數
app.get('/api', function(req, res) {
    var studentId = req.query.studentId;
    db.all("SELECT * FROM Student WHERE s_id = ?", [studentId], function(err, rows) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send(rows);
        }
    });
});

app.get('/registerPassword', function(req, res) {
    var studentId = req.query.studentId;
    var password = req.query.password;
    db.run("UPDATE Student SET password = ? WHERE s_id = ?", [password, studentId], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send({message: "Password registered successfully"});
        }
    });
});

//新增一個 API，可以取得所有學生的資料
app.get('/students', function(req, res) {
    db.all("SELECT * FROM Student", function(err, rows) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send(rows);
        }
    });
});

app.post('/login', (req, res) => {
    let db = new sqlite3.Database('./db/sqlite.db', sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  
    let sql = `SELECT name FROM Student WHERE s_id = ? AND password = ?`;
    db.get(sql, [req.body.username, req.body.password], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        res.json({ success: true, name: row.name });
      } else {
        res.json({ success: false });
      }
    });
  
    db.close();
  });
module.exports = app;