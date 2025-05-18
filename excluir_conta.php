<?php
session_start();
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST["confirmacao"]) && strtolower($_POST["confirmacao"]) === "confirmar exclusão") {
        try {
            $sql = "DELETE FROM usuarios WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $stmt->bind_param("i", $_SESSION["id"]);
            $stmt->execute();

            session_destroy();
            header("Location: login.php?conta_excluida=1");
            exit;
        } catch (Exception $e) {
            echo "Erro ao excluir conta: " . $e->getMessage();
        }
    } else {
        $error = "Confirmação inválida. Por favor, digite 'confirmar exclusão' para excluir sua conta.";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Excluir Conta</title>
</head>
<body>
    <div class="container">
        <h2>Excluir Conta Permanentemente</h2>
        <?php if (isset($error)) echo "<div class='alert alert-danger'>$error</div>"; ?>
        <form method="post">
            <div class="form-group">
                <label>Digite "CONFIRMAR EXCLUSÃO" para confirmar:</label>
                <input type="text" name="confirmacao" class="form-control" required>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-danger">Excluir Conta</button>
                <a href="index.php" class="btn btn-secondary">Cancelar</a>
            </div>
        </form>
    </div>
</body>
</html>