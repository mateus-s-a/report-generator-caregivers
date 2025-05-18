<?php
// incluir arquivo de configuração
require_once "config.php";

// definir variáveis e inicializar com valores vazios
$nome = $email = $senha = $confirmar_senha = "";
$nome_err = $email_err = $senha_err = $confirmar_senha_err = "";

// processando dados do formulário quando o formulário é enviado
if($_SERVER["REQUEST_METHOD"] == "POST") {
    // validar nome
    if (empty(trim($_POST["nome"]))) {
        $nome_err = "Por favor, insira seu nome.";
    } else {
        $nome = trim($_POST["nome"]);
    }
    
    // validar email
    if (empty(trim($_POST["email"]))) {
        $email_err = "Por favor, insira um email.";
    } else {
        // preparar declaração select
        $sql = "SELECT id FROM usuarios WHERE email = ?";
        
        if ($stmt = $mysqli->prepare($sql)) {
            // vincular variáveis à declaração preparada como parâmetros
            $stmt->bind_param("s", $param_email);
            
            // definir parâmetros
            $param_email = trim($_POST["email"]);
            
            // tentar executar a declaração preparada
            if ($stmt->execute()) {
                // armazenar resultado
                $stmt->store_result();
                
                if ($stmt->num_rows == 1) {
                    $email_err = "Este email já está em uso.";
                } else {
                    $email = trim($_POST["email"]);
                }
            } else {
                echo "Ops! Algo deu errado. Por favor, tente novamente mais tarde.";
            }

            // fechar declaração
            $stmt->close();
        }
    }
    
    // validar senha
    if (empty(trim($_POST["senha"]))) {
        $senha_err = "Por favor, insira uma senha.";     
    } elseif (strlen(trim($_POST["senha"])) < 6) {
        $senha_err = "A senha deve ter pelo menos 6 caracteres.";
    } else {
        $senha = trim($_POST["senha"]);
    }
    
    // validar confirmação de senha
    if (empty(trim($_POST["confirmar_senha"]))) {
        $confirmar_senha_err = "Por favor, confirme a senha.";     
    } else {
        $confirmar_senha = trim($_POST["confirmar_senha"]);
        if (empty($senha_err) && ($senha != $confirmar_senha)) {
            $confirmar_senha_err = "As senhas não conferem.";
        }
    }
    
    // verificar erros de entrada antes de inserir no banco de dados
    if (empty($nome_err) && empty($email_err) && empty($senha_err) && empty($confirmar_senha_err)) {
        
        // preparar declaração insert
        $sql = "INSERT INTO usuarios (user_id, nome, email, senha) VALUES (?, ?, ?, ?)";
         
        if ($stmt = $mysqli->prepare($sql)) {
            // vincular variáveis à declaração preparada como parâmetros
            $stmt->bind_param("ssss", $param_user_id, $param_nome, $param_email, $param_senha);
            
            // gerar ID de usuário único
            $param_user_id = uniqid("user_");
            $param_nome = $nome;
            $param_email = $email;
            $param_senha = password_hash($senha, PASSWORD_DEFAULT); // cria um hash da senha
            
            // tentar executar a declaração preparada
            if ($stmt->execute()) {
                // redirecionar para a página de login
                header("location: login.php");
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
    <title>Cadastro - Sistema de Cuidadores</title>
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="container">
        <h2>Cadastro</h2>
        <p>Por favor, preencha este formulário para criar uma conta.</p>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" name="nome" class="form-control <?php echo (!empty($nome_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $nome; ?>">
                <span class="invalid-feedback"><?php echo $nome_err; ?></span>
            </div>    
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $email; ?>">
                <span class="invalid-feedback"><?php echo $email_err; ?></span>
            </div>
            <div class="form-group">
                <label>Senha</label>
                <input type="password" name="senha" class="form-control <?php echo (!empty($senha_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $senha; ?>">
                <span class="invalid-feedback"><?php echo $senha_err; ?></span>
            </div>
            <div class="form-group">
                <label>Confirme a Senha</label>
                <input type="password" name="confirmar_senha" class="form-control <?php echo (!empty($confirmar_senha_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $confirmar_senha; ?>">
                <span class="invalid-feedback"><?php echo $confirmar_senha_err; ?></span>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Cadastrar">
                <input type="reset" class="btn btn-secondary ml-2" value="Limpar">
            </div>
            <p>Já tem uma conta? <a href="login.php">Entre aqui</a>.</p>
        </form>
    </div>    
</body>
</html>
