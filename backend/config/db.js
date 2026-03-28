import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "datacenter",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

pool.connect()
  .then(() => console.log(" PostgreSQL Connected"))
  .catch(err => console.error(" DB Error:", err));

export default pool;