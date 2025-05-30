<!DOCTYPE html>
<?php
session_start();
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}
?>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Cuidador</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

    <div class="user-bar">
        <span>Bem-vindo, <?php echo htmlspecialchars($_SESSION["nome"]); ?></span>
        <a href="logout.php" class="logout-btn">Sair</a>
        <a href="excluir_conta.php" class="delete-account">Excluir Conta</a>
    </div>

    <div class="container">
        <header>
            <h1>Relatório de Cuidador</h1>
            <p class="subtitle">Registre eventos e atividades diárias para acompanhamento do cuidado de idosos.</p>
        </header>

        <section class="form-section">
            <h2>Dados Básicos</h2>
            <div class="form-group">
                <label for="assistida">Nome da Pessoa Assistida:</label>
                <input type="text" id="assistida" placeholder="Nome da pessoa assistida">
            </div>
            <div class="form-group">
                <label for="cuidadora">Nome da Cuidadora:</label>
                <input type="text" id="cuidadora" placeholder="Nome da cuidadora">
            </div>
            <div class="form-group">
                <label for="data">Data do Relatório:</label>
                <input type="date" id="data">
            </div>
        </section>

        <section class="form-section">
            <h2>Período: MANHÃ</h2>
            <div id="eventosManha"></div>
            <button class="btn-add-evento" data-periodo="MANHÃ">Adicionar Evento</button>
        </section>

        <section class="form-section">
            <h2>Período: TARDE</h2>
            <div id="eventosTarde"></div>
            <button class="btn-add-evento" data-periodo="TARDE">Adicionar Evento</button>
        </section>

        <section class="form-section">
            <h2>Período: NOITE</h2>
            <div id="eventosNoite"></div>
            <button class="btn-add-evento" data-periodo="NOITE">Adicionar Evento</button>
        </section>

        <section class="form-section">
            <h2>Observações Gerais</h2>
            <div class="form-group">
                <label for="observacoes">Observações Importantes:</label>
                <textarea id="observacoes" placeholder="Adicione observações importantes sobre o dia..."></textarea>
            </div>
            <div class="form-actions">
                <button class="btn-preview" id="btnPreview">Visualizar Relatório</button>
                <button class="btn-download" id="btnDownload">Baixar Relatório</button>
            </div>
        </section>

        <footer>
            <p>© 2025 Relatório de Cuidador - Todos os direitos reservados</p>
        </footer>
    </div>

    <!-- Modal de Prévia do Relatório -->
    <div class="modal" id="previewModal">
        <div class="modal-content">
            <span class="close-modal" id="closePreviewModal">&times;</span>
            <h2>Prévia do Relatório</h2>
            <pre id="relatorioPreview" class="relatorio-preview"></pre>
            <button class="btn-download" id="btnDownloadModal">Baixar Relatório</button>
        </div>
    </div>

    <!-- Modal de Adicionar/Editar Evento -->
    <div class="modal" id="eventoModal">
        <div class="modal-content">
            <span class="close-modal" id="closeEventoModal">&times;</span>
            <h2>Adicionar Evento</h2>
            <input type="hidden" id="periodoEvento">

            <div class="form-group">
                <label>Horário:</label>
                <div class="selected-times-container">
                    <div id="horariosManha" class="periodo-horarios">
                        <button class="btn-horario" data-hora="06:00">06:00</button>
                        <button class="btn-horario" data-hora="07:00">07:00</button>
                        <button class="btn-horario" data-hora="08:00">08:00</button>
                        <button class="btn-horario" data-hora="09:00">09:00</button>
                        <button class="btn-horario" data-hora="10:00">10:00</button>
                        <button class="btn-horario" data-hora="11:00">11:00</button>
                    </div>
                    <div id="horariosTarde" class="periodo-horarios">
                        <button class="btn-horario" data-hora="12:00">12:00</button>
                        <button class="btn-horario" data-hora="13:00">13:00</button>
                        <button class="btn-horario" data-hora="14:00">14:00</button>
                        <button class="btn-horario" data-hora="15:00">15:00</button>
                        <button class="btn-horario" data-hora="16:00">16:00</button>
                        <button class="btn-horario" data-hora="17:00">17:00</button>
                    </div>
                    <div id="horariosNoite" class="periodo-horarios">
                        <button class="btn-horario" data-hora="18:00">18:00</button>
                        <button class="btn-horario" data-hora="19:00">19:00</button>
                        <button class="btn-horario" data-hora="20:00">20:00</button>
                        <button class="btn-horario" data-hora="21:00">21:00</button>
                        <button class="btn-horario" data-hora="22:00">22:00</button>
                        <button class="btn-horario" data-hora="23:00">23:00</button>
                    </div>
                </div>
                <div class="horario-personalizado">
                    <label for="horaPersonalizada">Horário personalizado:</label>
                    <input type="time" id="horaPersonalizada">
                </div>
                <div id="selectedTimesPreview" class="selected-times-preview"></div>
            </div>

            <div class="form-group">
                <label for="tipoEvento">Tipo de Evento:</label>
                <select id="tipoEvento">
                    <option value="">Selecione o tipo</option>
                    <option value="🍽️ Alimentação">🍽️ Alimentação</option>
                    <option value="💊 Medicação">💊 Medicação</option>
                    <option value="🚿 Higiene">🚿 Higiene</option>
                    <option value="🏥 Sinais Vitais">🏥 Sinais Vitais</option>
                    <option value="🏃 Atividade">🏃 Atividade</option>
                    <option value="📝 Outro">📝 Outro</option>
                </select>
            </div>

            <!-- Sinais Vitais Section -->
            <div id="sinaisVitaisSection" class="form-group" style="display: none;">
                <h3>Sinais Vitais</h3>

                <div class="form-group">
                    <label>Pressão Arterial (P.A.):</label>
                    <div class="pressao-arterial-inputs">
                        <input type="number" id="pressaoArterialMax" placeholder="Máx" min="0" max="300">
                        <span>/</span>
                        <input type="number" id="pressaoArterialMin" placeholder="Mín" min="0" max="300">
                    </div>
                </div>

                <div class="form-group">
                    <label for="spo2">SPO²:</label>
                    <input type="number" id="spo2" placeholder="%" min="0" max="100">
                </div>

                <div class="form-group">
                    <label for="frequenciaCardiaca">Frequência Cardíaca (F.C.):</label>
                    <input type="number" id="frequenciaCardiaca" placeholder="BPM" min="0" max="300">
                </div>

                <div class="form-group">
                    <label for="temperatura">Temperatura:</label>
                    <input type="number" id="temperatura" step="0.1" placeholder="°C" min="30" max="45">
                </div>
            </div>

            <!-- Higiene Section -->
            <div id="higieneSection" class="form-group" style="display: none;">
                <h3>Detalhes de Higiene</h3>

                <div class="form-group">
                    <label for="evacuacao">Evacuação:</label>
                    <select id="evacuacao">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="urinacao">Urinação:</label>
                    <select id="urinacao">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="descricaoEvento">Descrição:</label>
                <textarea id="descricaoEvento" placeholder="Descreva o evento..."></textarea>
            </div>

            <button class="btn-save" id="btnSalvarEvento">Salvar Evento</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>

</html>