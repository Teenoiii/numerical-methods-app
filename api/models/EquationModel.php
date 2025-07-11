<?php
class EquationModel
{
    private $conn;
    private $table = "equations";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT * FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRandom()
    {
        $query = "SELECT * FROM {$this->table} ORDER BY RAND() LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($expression)
    {
        $query = "INSERT INTO {$this->table} (expression) VALUES (:expression)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':expression', $expression);
        return $stmt->execute();
    }

    public function update($id, $expression)
    {
        $query = "UPDATE {$this->table} SET expression = :expression WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':expression', $expression);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
