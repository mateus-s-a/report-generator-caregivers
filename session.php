<?php
// inicializar a sessão
session_start();

// verificar se o usuário está logado, se não, redirecionar para a página de login
if (!isset($_SESSION["loggedin"]) || 
    $_SESSION["user_ip"] !== $_SERVER["REMOTE_ADDR"] ||
    $_SESSION["user_agent"] !== $_SERVER["HTTP_USER_AGENT"]) {
    session_destroy();
    header("location: login.php");
    exit;
}
?>