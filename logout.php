<?php
// inicializar a sessão
session_start();

// remover todas as variáveis de sessão
$_SESSION = array();

// destruir a sessão
session_destroy();

// redirecionar para a página de login
header("location: login.php");
exit;
?>