import mysql from "mysql2/promise";

export async function GET(request) {
  try {
    // Establish MySQL connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1111",
      database: "radarDb",
    });

    // Query the latest distance data
    const [rows] = await connection.execute(
      "SELECT dist FROM radartousrp ORDER BY id DESC LIMIT 1"
    );
    connection.end();

    // return new Response(JSON.stringify({ distance: rows[0].dist }), {
    return new Response(JSON.stringify({ distance: rows[0].dist }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ distance: 0,error: "Database query failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
