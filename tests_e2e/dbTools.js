const sql = require("mssql/msnodesqlv8");

async function connectToDb() {
  const connectionPool = new sql.ConnectionPool({
    database: "origam-demo",
    server: "localhost",
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true
    }
  });

  return connectionPool.connect();
}

async function executeProcedure(procedureName){
  const pool = await connectToDb();
  try{
    const request = pool.request();
    const result = await request.query(`EXEC ${procedureName};`);
  }
  finally{
    pool.close()
  }
}

// restores original state of the AllDataTypes and dependent tables
async function restoreAllDataTypesTable(){
  await executeProcedure("dbo.restoreAllDataTypes");
}

// restores original state of the WidgetSectionTestMaster and dependent tables
async function restoreWidgetSectionTestMaster(){
  await executeProcedure("dbo.restoreWidgetSectionTestMaster");
}

module.exports = { restoreAllDataTypesTable, restoreWidgetSectionTestMaster }

// for module testing purposes:
// restoreAllDataTypesTable().then(r => console.log("DONE"));