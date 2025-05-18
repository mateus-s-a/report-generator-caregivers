<?php
// inicializar a sessão
session_start();
 
// verificar se o usuário já está logado, em caso afirmativo redirecionar para a página de boas-vindas
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: index.html");
    exit;
}
 
// incluir arquivo de configuração
require_once "config.php";
 
// definir variáveis e inicializar com valores vazios
$email = $senha = "";
$email_err = $senha_err = $login_err = "";
 
// processando dados do formulário quando o formulário é enviado
if($_SERVER["REQUEST_METHOD"] == "POST"){
 
    // verificar se o email está vazio
    if (empty(trim($_POST["email"]))) {
        $email_err = "Por favor, insira seu email.";
    } else {
        $email = trim($_POST["email"]);
    }
    
    // verificar se a senha está vazia
    if (empty(trim($_POST["senha"]))) {
        $senha_err = "Por favor, insira sua senha.";
    } else {
        $senha = trim($_POST["senha"]);
    }
    
    // validar credenciais
    if (empty($email_err) && empty($senha_err)) {
        // preparar declaração select
        $sql = "SELECT id, user_id, nome, email, senha FROM usuarios WHERE email = ?";
        
        if ($stmt = $mysqli->prepare($sql)) {
            // vincular variáveis à declaração preparada como parâmetros
            $stmt->bind_param("s", $param_email);
            
            // definir parâmetros
            $param_email = $email;
            
            // tentar executar a declaração preparada
            if ($stmt->execute()) {
                // armazenar resultado
                $stmt->store_result();
                
                // verificar se o email existe, se sim, verificar a senha
                if ($stmt->num_rows == 1) {
                    // vincular variáveis de resultado
                    $stmt->bind_result($id, $user_id, $nome, $email, $hashed_password);
                    if ($stmt->fetch()) {
                        if( password_verify($senha, $hashed_password)) {
                            // senha está correta, então iniciar uma nova sessão
                            session_start();
                            
                            // armazenar dados em variáveis de sessão
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["user_id"] = $user_id;
                            $_SESSION["nome"] = $nome;
                            $_SESSION["email"] = $email;                            
                            
                            // redirecionar o usuário para a página de boas-vindas
                            header("location: index.html");
                        } else {
                            // senha não é válida, mostrar mensagem de erro genérica
                            $login_err = "Email ou senha inválidos.";
                        }
                    }
                } else {
                    // email não existe, mostrar mensagem de erro genérica
                    $login_err = "Email ou senha inválidos.";
                }
            } else {
                echo "Ops! Algo deu errado. Por favor, tente novamente mais tarde.";
            }

            // fechar declaração
            $stmt->close();
        }
    }
    
    // fechar conexão
    $mysqli->close();
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Login - Sistema de Cuidadores</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h2>Login</h2>
        <p>Por favor, preencha seus dados para entrar.</p>

        <?php 
        if (!empty($login_err)) {
            echo '<div class="alert alert-danger">' . $login_err . '</div>';
        }        
        ?>

        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $email; ?>">
                <span class="invalid-feedback"><?php echo $email_err; ?></span>
            </div>    
            <div class="form-group">
                <label>Senha</label>
                <input type="password" name="senha" class="form-control <?php echo (!empty($senha_err)) ? 'is-invalid' : ''; ?>">
                <span class="invalid-feedback"><?php echo $senha_err; ?></span>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Entrar">
            </div>
            <p>Não tem uma conta? <a href="registro.php">Cadastre-se agora</a>.</p>
        </form>
    </div>
</body>
</html>
