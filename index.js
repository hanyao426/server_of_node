const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const router = express.Router();
const option = {
  host: "localhost",
  user: "root",
  password: "1234",
  port: "3306",
  database: "test",
  connectTimeout: 3000, //连接超时
  multipleStatements: false, //是否准许一条参数包含多条sql语句
};

app.listen(3000, () => console.log("服务启动"));
app.use(bodyParser.json()); //json请求
app.use(bodyParser.urlencoded({ extended: false })); //解析路径参数
app.use(cors()); //解决跨域

const conn = mysql.createConnection(option);
conn.connect();

let login = true;
let studentList = [];

app.all("/*", (req, res, next) => {
  if (!login) return res.json("未登录");
  next();
});
// app.post('/test/:data',(req,res)=>{
//   console.log(req);
//   res.json({query:req.query,data:req.params,json:req.body})
//   // res.send('<div style="color:red">hello word!</div>')
// })
//获取学生列表
app.post("/getStudentInfo", (req, res) => {
  conn.query("SELECT * FROM student", (e, r) => {
    if (e) {
      res.json(new Result({ code: 0, msg: e.message }));
      return;
    }
    res.json(new Result({ data: r }));
  });
});
app.post("/addStudentItem", (req, res) => {
  let reqCopy = req;
  if (!("id" in reqCopy.body)) {
    conn.query("SELECT * FROM student", (e, r) => {
      reqCopy.body.id = r.length + 1;
      conn.query(
        `INSERT INTO student(name,sex,age,address,id) VALUES('${reqCopy.body.name}',${reqCopy.body.sex},${reqCopy.body.age},'${reqCopy.body.address}',${reqCopy.body.id})`,
        reqCopy.body,
        (e, r) => {
          if (e) {
            console.log(e);
            res.json(new Result({ code: e.code, msg: e.sqlMessage }));
            return;
          }
          res.json(new Result({}));
        }
      );
    });
  } else {
    conn.query(
      `INSERT INTO student(name,sex,age,address,id) VALUES('${req.body.name}',${req.body.sex},${req.body.age},'${req.body.address}',?)`,
      req.body,
      (e, r) => {
        if (e) {
          
          res.json(new Result({ code: e.code, msg: e.sqlMessage }));
          return;
        }
        res.json(new Result({}));
      }
    );
  }
});

function Result({ code = 1, msg = "success", data = [] }) {
  this.code = code;
  this.msg = msg;
  this.data = data;
}
