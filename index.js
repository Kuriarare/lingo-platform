
require('dotenv').config({ path: '/var/www/lingo-academy-server/.env' });

const server = require('./src/server');
const dbCon =  require('./src/config/dbCon');
const PORT = 8000;

dbCon().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.log("DB Connection Error:", error);
});