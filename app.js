import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import mysql from "mysql";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

// database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "fafa123",
  database: "zipcodes",
});

// connect to database
db.connect((err) => {
  if (err) return console.error(err);
  console.log("connected to database...");
});

// post data to database
const postToDb = (data, stmt) => {
  db.query(stmt, [data], (err, results) => {
    if (err) {
      return console.error(err.message);
    }
    // get inserted rows
    console.log("Rows inserted:" + results.affectedRows);
  });
};

for (let j = 80; j < 81; j++) {
  const res = await fetch(
    `https://www.codepostal.ma/search_mot.aspx?keyword=${j}`,
    {
      method: "GET",
    }
  );
  const data = await res.text();
  const dom = new JSDOM(data);
  const $ = (selector) => dom.window.document.querySelectorAll(selector);

  let tds = $("#DgCodeparAdresse tr > td");
  let stmt = "";
  if (tds.length > 0) {
    const rowsCount = tds.length / 3;
    let arr = [];
    tds.forEach((td) => {
      arr.push(td.textContent);
    });
    let arrayData = [];
    for (let i = 0; i < rowsCount - 1; i++) {
      const rr = arr.splice(3, 3);
      arrayData.push(rr);
    }

    let filtered = [];
    arrayData.map((a) => {
      if (a[2].substring(0, 2) === j.toString()) {
        filtered.push(a);
      }
    });

    if (filtered.length > 0) {
      stmt = "INSERT INTO zipbyd (ville, quartier, code_postal) VALUES ? ";
      postToDb(filtered, stmt);
      console.log(j);
    }
  }
  tds = $("#DgCodeparLocalite tr > td");
  if (tds.length > 0) {
    const rowsCount = tds.length / 4;
    let arr = [];
    tds.forEach((td) => {
      arr.push(td.textContent);
    });
    let arrayData = [];
    for (let i = 0; i < rowsCount - 1; i++) {
      const rr = arr.splice(4, 4);
      arrayData.push(rr);
    }

    let filtered = [];
    arrayData.map((a) => {
      if (a[3].substring(0, 2) === j.toString()) {
        filtered.push(a);
      }
    });

    if (filtered.length > 0) {
      stmt =
        "INSERT INTO zipbyl (region, province, localite, code_postal) VALUES ? ";
      postToDb(filtered, stmt);
      console.log(j);
    }
  }
  tds = $("#DgCodeparAgence tr > td");
  if (tds.length > 0) {
    const rowsCount = tds.length / 4;
    let arr = [];
    tds.forEach((td) => {
      arr.push(td.textContent);
    });
    let arrayData = [];
    for (let i = 0; i < rowsCount - 1; i++) {
      const rr = arr.splice(4, 4);
      arrayData.push(rr);
    }

    const filtered = arrayData.filter(
      (a) => a[3].substring(0, 2) === j.toString()
    );

    if (filtered.length > 0) {
      stmt =
        "INSERT INTO zipbya (region, province, agence, code_postal) VALUES ? ";
      postToDb(filtered, stmt);
      console.log(j);
    }
  }
}

db.end();
