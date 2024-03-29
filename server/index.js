const express = require("express");
const cors = require("cors");
const { BigQuery } = require("@google-cloud/bigquery");
const app = express();

app.use(cors());

const bigquery = new BigQuery({
  keyFilename: "gcp_key.json",
  projectId: "airy-coil-412413",
});

// Endpoint to get the most common vehicle class
app.get("/most_common_vehicle", async (req, res) => {
  try {
    const query = `
      SELECT class, COUNT(*) as count
      FROM highd.Results
      GROUP BY class
      ORDER BY count DESC
      LIMIT 1;
    `;
    const options = {
      query: query,
    };

    const [rows] = await bigquery.query(options);
    res.json(rows[0]); // Send only the first row which contains the most common vehicle class
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/total_lane_changes", async (req, res) => {
  try {
    const query = `
      SELECT SUM(numLaneChanges) as totalLaneChanges
      FROM highd.Results;
    `;
    const options = {
      query: query,
    };

    const [rows] = await bigquery.query(options);
    const totalLaneChanges = rows[0].totalLaneChanges;
    res.json({ totalLaneChanges });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/data", async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const [totalRows] = await bigquery.query({
      query: "SELECT COUNT(*) as totalRows FROM highd.Results;",
    });
    const totalRecords = totalRows[0].totalRows;

    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;

    const query = `SELECT * FROM highd.Results LIMIT ${pageSize} OFFSET ${offset};`;
    const options = {
      query: query,
    };

    const [rows] = await bigquery.query(options);
    res.json({ rows, totalRecords });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
