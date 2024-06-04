const appserver = require("./app.js");
const {conn} = require("./db/db.js");

conn.sync({force: false}).then(() => {
  appserver.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
  })
});