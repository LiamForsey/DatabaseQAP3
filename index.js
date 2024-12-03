const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "QAP3",
  password: "Diesel13",
  port: 5432,
});

// Initialize database table
async function initializeDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        status VARCHAR(50) CHECK (status IN ('incomplete', 'complete')) NOT NULL
      );
    `;
    try {
      await pool.query(createTableQuery);
      console.log("Database initialized successfully (or already exists)");
    } catch (error) {
      console.error("Error initializing database: ", error);
    }
  }
  


  // GET /tasks - Get all tasks
  app.get("/tasks", async (req, res) => {
    try {
      console.log("Fetching all tasks from the database...");
      const result = await pool.query("SELECT * FROM tasks ORDER BY id");
      console.log(`Fetched ${result.rows.length} tasks.`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  



  // POST /tasks - Add a new task
  app.post("/tasks", async (request, response) => {
    const { description, status } = request.body;
  
    if (!description || !status) {
      console.log("Invalid request: missing required fields");
      return response
        .status(400)
        .json({ error: "Description and status are required" });
    }
  
    if (!["incomplete", "complete"].includes(status)) {
      console.log(`Invalid status: ${status}`);
      return response
        .status(400)
        .json({ error: 'Status must be either "incomplete" or "complete"' });
    }
  
    try {
      console.log(`Adding new task: Description=${description}, Status=${status}`);
      const insertQuery =
        "INSERT INTO tasks (description, status) VALUES ($1, $2)";
      await pool.query(insertQuery, [description, status]);
      console.log("Task added successfully");
      response.status(201).json({ message: "Task added successfully" });
    } catch (error) {
      console.error("Error adding task:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
  



  // PUT /tasks/:id - Update a task's status
  app.put("/tasks/:id", async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
  
    if (!["incomplete", "complete"].includes(status)) {
      console.log(`Invalid status: ${status}`);
      return response
        .status(400)
        .json({ error: 'Status must be either "incomplete" or "complete"' });
    }
  
    try {
      console.log(`Updating task with ID=${taskId} to status=${status}`);
      const updateQuery = "UPDATE tasks SET status = $1 WHERE id = $2";
      const result = await pool.query(updateQuery, [status, taskId]);
  
      if (result.rowCount === 0) {
        console.log(`Task with ID=${taskId} not found`);
        return response.status(404).json({ error: "Task not found" });
      }
  
      console.log("Task updated successfully");
      response.json({ message: "Task updated successfully" });
    } catch (error) {
      console.error("Error updating task:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
  



  // DELETE /tasks/:id - Delete a task
  app.delete("/tasks/:id", async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
  
    try {
      console.log(`Deleting task with ID=${taskId}`);
      const deleteQuery = "DELETE FROM tasks WHERE id = $1";
      const result = await pool.query(deleteQuery, [taskId]);
  
      if (result.rowCount === 0) {
        console.log(`Task with ID=${taskId} not found`);
        return response.status(404).json({ error: "Task not found" });
      }
  
      console.log("Task deleted successfully");
      response.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  });
  


  
  // Initialize database and start server
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });



