// const app = require("./src/server");
// const dbCon = require('./src/config/dbCon');

// dbCon().then(() => {
//     app.listen(3001, () => {
//         console.log("Server is running on http://localhost:3001");
//       });
// }).catch((error) => {
//   console.log("DB Connection Error:", error);
// });



const server = require('./src/server');
const dbCon = require('./src/config/dbCon');

dbCon().then(() => {
  server.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
  });
}).catch((error) => {
  console.log("DB Connection Error:", error);
});
