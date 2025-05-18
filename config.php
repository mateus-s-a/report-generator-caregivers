<?php
// informações do banco de dados
define('DB_SERVER', 'sql208.infinityfree.com');
define('DB_USERNAME', 'if0_38742417');
define('DB_PASSWORD', 'l8xN8CSKUIfQ');
define('DB_NAME', 'if0_38742417_db_relatorio_cuidador_idosos');

// conectando ao banco de dados
$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// verificando a conexão
if ($mysqli == false) {
    die("ERRO: Não foi possível conectar ao banco de dados. " . $mysqli->connect_error);
}

// configurando charset para UTF-8
$mysqli->set_charset("utf8");
?>