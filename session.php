<?php
// inicializar a sessão
session_start();

// verificar se o usuário está logado, se não, redirecionar para a página de login
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}
?>