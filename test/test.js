"use strict";
// // import nf=require("node-forge");
Object.defineProperty(exports, "__esModule", { value: true });
// // const md1=nf.md.sha512.create();
// // md1.update("Testing");
// // const hex1=md1.digest().toHex();
// // const md2=nf.md.sha512.create();
// // md2.update("Testing");
// // const hex2=md2.digest().toHex();
// // console.log(hex1);
// // console.log(hex2);
// // console.log(hex1===hex2);
// import mongoose = require("mongoose");
// import Schemas = require("../server/src/schema");
// function findInDB(table, what) {
//     mongoose.connect("mongodb://127.0.0.1:27017/votedb");
//     if (table === "Vote") return Schemas[table].findOne({ subjectName: what }).then(x => {
//         return x;
//     });
//     if (table === "User") return Schemas[table].findOne({ embg: what }).then(x => {
//         return x;
//     });
// }
// function updateDB(table, who, change) {
//     if (table === "Vote") return Schemas[table].update({ subjectName: who }, change).then(x => {return x;});
//     if (table === "User") return Schemas[table].update({ embg: who }, change).then(x => {return x;});
// }
// console.log("1");
// async function vote(embg, option) {
//     console.log("2");
//     const x = await findInDB("User", embg)
//     console.log(x);
//     const z=await updateDB("User", embg, { voteCount: (Number(x.voteCount) + 1) });
//     console.log(z);
//     mongoose.disconnect();
//     // Schemas.User.findOne({ embg: res.locals.data.embg }).then((user: any) => {
//     //     if (user === null) res.status(400).send("User not found");
//     //     else {
//     //         if (user.validVote(user.voteCount))
//     //             saveToDB(req.body.option).then((x) => {
//     //                 Schemas.User.update({ embg: res.locals.data.embg }, { voteCount: (user.voteCount + 1) }).then(() => {
//     //                     res.clearCookie("Bearer");
//     //                     res.status(200).send(x);
//     //                 });
//     //             });
//     //         else res.status(400).send("NO VOTES REMAINING");
//     //     }
//     // });
// }
// vote("123", "bmw");
var nf = require("node-forge");
var key = nf.random.getBytesSync(16);
var iv = "&Y,')6rOcnQ?IHBMU[QTM\-rF][tLk{";
var message = "Hello World";
var cipher = nf.cipher.createCipher("AES-CBC", key);
cipher.start({ iv: iv });
cipher.update(nf.util.createBuffer(new Buffer(message)));
cipher.finish();
var encrypted = cipher.output.data;
console.log(message);
console.log("-", encrypted);
encrypted = nf.util.createBuffer(new Buffer(cipher.output.data));
var decipher = nf.cipher.createDecipher("AES-CBC", key);
decipher.start({ iv: iv });
decipher.update(encrypted);
decipher.finish();
console.log("-", decipher.output.data);
