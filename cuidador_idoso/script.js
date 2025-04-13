document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const assistidaInput = document.getElementById('assistida');
    const cuidadoraInput = document.getElementById('cuidadora');
    const dataInput = document.getElementById('data');
    const observacoesInput = document.getElementById('observacoes');

    const btnAddEventoManhaEl = document.querySelector('[data-periodo="MANHÃ"]');
    const btnAddEventoTardeEl = document.querySelector('[data-periodo="TARDE"]');
    const btnAddEventoNoiteEl = document.querySelector('[data-periodo="NOITE"]');

    const eventosManha = document.getElementById('eventosManha');
    const eventosTarde = document.getElementById('eventosTarde');
    const eventosNoite = document.getElementById('eventosNoite');

    const btnPreview = document.getElementById('btnPreview');
    const btnDownload = document.getElementById('btnDownload');
    const btnDownloadModal = document.getElementById('btnDownloadModal');

    const previewModal = document.getElementById('previewModal');
    const eventoModal = document.getElementById('eventoModal');
    const btnSalvarEvento = document.getElementById('btnSalvarEvento');

    const relatorioPreview = document.getElementById('relatorioPreview');
    const periodoEventoInput = document.getElementById('periodoEvento');
    const horaPersonalizadaInput = document.getElementById('horaPersonalizada');
    const tipoEventoSelect = document.getElementById('tipoEvento');
    const descricaoEventoTextarea = document.getElementById('descricaoEvento');

    // Variáveis para controle de edição
    let modoEdicao = false;
    let eventoEmEdicao = null;

    // Aplicar animações nos elementos ao carregar
    function aplicarAnimacoesIniciais() {
        const sections = document.querySelectorAll('.form-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });
    }

    aplicarAnimacoesIniciais();

    // Efeito de ripple para botões
    function criarEfeitoRipple(event) {
        if (!this.classList.contains('btn-download') && !this.classList.contains('btn-save')) {
            return;
        }

        const button = this;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Adicionar efeito ripple a todos os botões
    const botoes = document.querySelectorAll('.btn-download, .btn-save');
    botoes.forEach(botao => {
        botao.addEventListener('click', criarEfeitoRipple);
    });

    // Gerenciamento de modais
    const closeBtns = document.querySelectorAll('.close-modal');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            fecharModal(previewModal);
            fecharModal(eventoModal);

            // Resetar modo de edição ao fechar o modal
            modoEdicao = false;
            eventoEmEdicao = null;
        });
    });

    function abrirModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Evitar scroll do body

        // Fade in com animação
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    function fecharModal(modal) {
        modal.style.opacity = '0';

        // Aguardar a animação terminar antes de esconder
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    window.addEventListener('click', function(event) {
        if (event.target === previewModal) {
            fecharModal(previewModal);
        }
        if (event.target === eventoModal) {
            fecharModal(eventoModal);
            // Resetar modo de edição ao fechar o modal
            modoEdicao = false;
            eventoEmEdicao = null;
        }
    });

    // Definir data atual como padrão
    const hoje = new Date();
    dataInput.value = hoje.getFullYear() + '-' + padZero(hoje.getMonth() + 1) + '-' + padZero(hoje.getDate());

    // Eventos de adicionar eventos por período
    btnAddEventoManhaEl.addEventListener('click', () => abrirModalEvento('MANHÃ'));
    btnAddEventoTardeEl.addEventListener('click', () => abrirModalEvento('TARDE'));
    btnAddEventoNoiteEl.addEventListener('click', () => abrirModalEvento('NOITE'));

    // Botões de horário pré-definidos
    const botoesHorario = document.querySelectorAll('.btn-horario');
    let horarioSelecionado = null;

    botoesHorario.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover seleção anterior
            botoesHorario.forEach(b => b.classList.remove('selected'));

            // Adicionar seleção atual com animação
            this.classList.add('selected');
            animarSelecao(this);

            // Armazenar o horário selecionado
            horarioSelecionado = this.getAttribute('data-hora');

            // Limpar campo de horário personalizado
            horaPersonalizadaInput.value = '';
        });
    });

    // Animar seleção de botão
    function animarSelecao(elemento) {
        elemento.style.transform = 'scale(1.05)';
        setTimeout(() => {
            elemento.style.transform = '';
        }, 200);
    }

    // Ao digitar no horário personalizado, limpar seleção de botões
    horaPersonalizadaInput.addEventListener('input', function() {
        botoesHorario.forEach(b => b.classList.remove('selected'));
        horarioSelecionado = null;
    });

    // Salvar evento
    btnSalvarEvento.addEventListener('click', function() {
        const periodo = periodoEventoInput.value;
        const tipo = tipoEventoSelect.value;
        const descricao = descricaoEventoTextarea.value;

        // Verificar se temos um horário (seja por botão ou personalizado)
        let hora = horarioSelecionado;
        if (!hora && horaPersonalizadaInput.value) {
            hora = horaPersonalizadaInput.value;
        }

        if (!hora || !tipo || !descricao) {
            exibirNotificacao('Por favor, preencha todos os campos obrigatórios: horário, tipo e descrição.', 'error');
            return;
        }

        if (modoEdicao && eventoEmEdicao) {
            // Atualizar evento existente
            atualizarEvento(eventoEmEdicao, hora, tipo, descricao);
            exibirNotificacao('Evento atualizado com sucesso!', 'success');
        } else {
            // Adicionar novo evento
            adicionarEvento(periodo, hora, tipo, descricao);
            exibirNotificacao('Evento adicionado com sucesso!', 'success');
        }

        // Limpar e fechar modal
        tipoEventoSelect.value = '';
        descricaoEventoTextarea.value = '';
        botoesHorario.forEach(b => b.classList.remove('selected'));
        horaPersonalizadaInput.value = '';
        horarioSelecionado = null;
        modoEdicao = false;
        eventoEmEdicao = null;
        fecharModal(eventoModal);
    });

    // Função para exibir notificações
    function exibirNotificacao(mensagem, tipo) {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`;
        notificacao.textContent = mensagem;

        // Adicionar ao corpo do documento
        document.body.appendChild(notificacao);

        // Animar entrada
        setTimeout(() => {
            notificacao.style.transform = 'translateY(0)';
            notificacao.style.opacity = '1';
        }, 10);

        // Remover após alguns segundos
        setTimeout(() => {
            notificacao.style.transform = 'translateY(-20px)';
            notificacao.style.opacity = '0';

            setTimeout(() => {
                notificacao.remove();
            }, 300);
        }, 3000);
    }

    // Adicionar estilos para a notificação se não existirem
    function adicionarEstilosNotificacao() {
        if (!document.querySelector('#estilosNotificacao')) {
            const estilos = document.createElement('style');
            estilos.id = 'estilosNotificacao';
            estilos.textContent = `
                .notificacao {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    transform: translateY(-20px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    max-width: 300px;
                }
                .notificacao.success {
                    background-color: #2ecc71;
                }
                .notificacao.error {
                    background-color: #e74c3c;
                }
            `;
            document.head.appendChild(estilos);
        }
    }

    adicionarEstilosNotificacao();

    // Visualizar relatório
    btnPreview.addEventListener('click', function() {
        relatorioPreview.textContent = gerarRelatorio();
        abrirModal(previewModal);

        // Ajuste para mobile
        ajustarModalMobile();
    });

    // Baixar relatório
    btnDownload.addEventListener('click', function() {
        downloadRelatorio();
        exibirNotificacao('Relatório baixado com sucesso!', 'success');
    });

    btnDownloadModal.addEventListener('click', function() {
        downloadRelatorio();
        fecharModal(previewModal);
        exibirNotificacao('Relatório baixado com sucesso!', 'success');
    });

    // Ajuste para modais em dispositivos móveis
    function ajustarModalMobile() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Garantir que a rolagem da página vá para o topo do modal
            setTimeout(() => {
                const modalRect = document.querySelector('.modal-content').getBoundingClientRect();
                window.scrollTo({
                    top: window.scrollY + modalRect.top,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }

    // Funções auxiliares
    function abrirModalEvento(periodo) {
        periodoEventoInput.value = periodo;

        // Mostrar apenas os botões de horário relevantes para o período
        const horariosManha = document.getElementById('horariosManha');
        const horariosTarde = document.getElementById('horariosTarde');
        const horariosNoite = document.getElementById('horariosNoite');

        if (periodo === 'MANHÃ') {
            horariosManha.style.display = 'flex';
            horariosTarde.style.display = 'none';
            horariosNoite.style.display = 'none';
        } else if (periodo === 'TARDE') {
            horariosManha.style.display = 'none';
            horariosTarde.style.display = 'flex';
            horariosNoite.style.display = 'none';
        } else if (periodo === 'NOITE') {
            horariosManha.style.display = 'none';
            horariosTarde.style.display = 'none';
            horariosNoite.style.display = 'flex';
        }

        // Limpar seleções anteriores
        botoesHorario.forEach(b => b.classList.remove('selected'));
        horaPersonalizadaInput.value = '';
        horarioSelecionado = null;
        tipoEventoSelect.value = '';
        descricaoEventoTextarea.value = '';

        // Resetar modo de edição
        modoEdicao = false;
        eventoEmEdicao = null;

        abrirModal(eventoModal);
    }

    function adicionarEvento(periodo, hora, tipo, descricao) {
        const eventoContainer = periodo === 'MANHÃ' ? eventosManha :
            periodo === 'TARDE' ? eventosTarde : eventosNoite;

        const tipoIcone = getIconeParaTipo(tipo);
        const tipoNome = getTipoNome(tipo);

        const eventoCard = document.createElement('div');
        eventoCard.className = 'evento-card';
        eventoCard.setAttribute('data-hora', hora);
        eventoCard.setAttribute('data-tipo', tipo);
        eventoCard.setAttribute('data-descricao', descricao);
        eventoCard.setAttribute('data-periodo', periodo);

        // HTML dos botões
        eventoCard.innerHTML = `
            <span class="evento-hora">${hora}</span>
            <span class="evento-tipo">${tipoIcone} ${tipoNome}</span>
            <p class="evento-descricao">${descricao}</p>
            <div class="evento-acoes">
                <button type="button" class="btn-editar-evento" title="Editar evento">E</button>
                <button type="button" class="btn-remover-evento" title="Remover evento">×</button>
            </div>
        `;

        // Adicionar evento para remover este card
        const btnRemover = eventoCard.querySelector('.btn-remover-evento');
        btnRemover.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação do evento

            // Animação de fade out
            eventoCard.style.opacity = '0';
            eventoCard.style.transform = 'scale(0.95)';

            setTimeout(() => {
                eventoContainer.removeChild(eventoCard);
            }, 300);
        });

        // Adicionar evento para editar este card
        const btnEditar = eventoCard.querySelector('.btn-editar-evento');
        btnEditar.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação do evento
            iniciarEdicaoEvento(eventoCard);
        });

        // Adicionar ao container com animação
        eventoCard.style.opacity = '0';
        eventoCard.style.transform = 'translateY(20px)';
        eventoContainer.appendChild(eventoCard);

        // Forçar reflow para animar
        eventoCard.offsetHeight;

        // Animar entrada
        eventoCard.style.opacity = '1';
        eventoCard.style.transform = 'translateY(0)';

        // Ordenar por horário
        setTimeout(() => ordenarEventosPorHorario(eventoContainer), 300);
    }

    function iniciarEdicaoEvento(eventoCard) {
        // Destacar visualmente o card sendo editado
        const todosCards = document.querySelectorAll('.evento-card');
        todosCards.forEach(card => card.classList.remove('editando'));
        eventoCard.classList.add('editando');

        // Configurar o modo de edição
        modoEdicao = true;
        eventoEmEdicao = eventoCard;

        // Obter dados do evento
        const periodo = eventoCard.getAttribute('data-periodo');
        const hora = eventoCard.getAttribute('data-hora');
        const tipo = eventoCard.getAttribute('data-tipo');
        const descricao = eventoCard.getAttribute('data-descricao');

        // Preencher o modal com esses dados
        periodoEventoInput.value = periodo;
        tipoEventoSelect.value = tipo;
        descricaoEventoTextarea.value = descricao;

        // Mostrar os botões de horário relevantes para o período
        const horariosManha = document.getElementById('horariosManha');
        const horariosTarde = document.getElementById('horariosTarde');
        const horariosNoite = document.getElementById('horariosNoite');

        horariosManha.style.display = 'none';
        horariosTarde.style.display = 'none';
        horariosNoite.style.display = 'none';

        if (periodo === 'MANHÃ') {
            horariosManha.style.display = 'flex';
        } else if (periodo === 'TARDE') {
            horariosTarde.style.display = 'flex';
        } else if (periodo === 'NOITE') {
            horariosNoite.style.display = 'flex';
        }

        // Configurar o horário
        const botaoHorario = document.querySelector(`.btn-horario[data-hora="${hora}"]`);
        if (botaoHorario) {
            // Limpar todas as seleções anteriores
            botoesHorario.forEach(b => b.classList.remove('selected'));
            // Selecionar o botão correspondente
            botaoHorario.classList.add('selected');
            horarioSelecionado = hora;
            horaPersonalizadaInput.value = '';
        } else {
            // Se não for um horário predefinido, usar o campo personalizado
            botoesHorario.forEach(b => b.classList.remove('selected'));
            horarioSelecionado = null;
            horaPersonalizadaInput.value = hora;
        }

        // Abrir modal
        abrirModal(eventoModal);
    }

    function atualizarEvento(eventoCard, hora, tipo, descricao) {
        // Atualizar os atributos do card
        eventoCard.setAttribute('data-hora', hora);
        eventoCard.setAttribute('data-tipo', tipo);
        eventoCard.setAttribute('data-descricao', descricao);

        // Atualizar o conteúdo visual do card
        const tipoIcone = getIconeParaTipo(tipo);
        const tipoNome = getTipoNome(tipo);

        eventoCard.querySelector('.evento-hora').textContent = hora;
        eventoCard.querySelector('.evento-tipo').textContent = `${tipoIcone} ${tipoNome}`;
        eventoCard.querySelector('.evento-descricao').textContent = descricao;

        // Destacar brevemente o card atualizado
        eventoCard.style.transition = 'background-color 0.5s ease';
        eventoCard.style.backgroundColor = 'rgba(58, 123, 213, 0.1)';
        setTimeout(() => {
            eventoCard.style.backgroundColor = '';
            eventoCard.classList.remove('editando');
        }, 1000);

        // Reordenar os eventos
        const periodo = eventoCard.getAttribute('data-periodo');
        const eventoContainer = periodo === 'MANHÃ' ? eventosManha :
            periodo === 'TARDE' ? eventosTarde : eventosNoite;

        ordenarEventosPorHorario(eventoContainer);
    }

    function ordenarEventosPorHorario(container) {
        const eventos = Array.from(container.querySelectorAll('.evento-card'));

        eventos.sort((a, b) => {
            const horaA = a.querySelector('.evento-hora').textContent;
            const horaB = b.querySelector('.evento-hora').textContent;
            return horaA.localeCompare(horaB);
        });

        // Limpar container e readicionar em ordem com animações
        container.innerHTML = '';

        eventos.forEach((evento, index) => {
            // Reset das propriedades de animação
            evento.style.opacity = '1';
            evento.style.transform = 'translateY(0)';
            evento.style.animationDelay = `${index * 0.05}s`;

            container.appendChild(evento);

            // Recriar os event listeners
            const btnRemover = evento.querySelector('.btn-remover-evento');
            btnRemover.addEventListener('click', function(e) {
                e.stopPropagation();
                evento.style.opacity = '0';
                evento.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    container.removeChild(evento);
                }, 300);
            });

            const btnEditar = evento.querySelector('.btn-editar-evento');
            btnEditar.addEventListener('click', function(e) {
                e.stopPropagation();
                iniciarEdicaoEvento(evento);
            });
        });
    }

    function getIconeParaTipo(tipo) {
        switch(tipo) {
            case 'alimentacao': return '🍽️';
            case 'medicacao': return '💊';
            case 'higiene': return '🚿';
            case 'sinaisvitais': return '🏥';
            case 'atividade': return '🏃';
            case 'outro': return '📝';
            default: return '📝';
        }
    }

    function getTipoNome(tipo) {
        switch(tipo) {
            case 'alimentacao': return 'Alimentação';
            case 'medicacao': return 'Medicação';
            case 'higiene': return 'Higiene';
            case 'sinaisvitais': return 'Sinais Vitais';
            case 'atividade': return 'Atividade';
            case 'outro': return 'Outro';
            default: return 'Evento';
        }
    }

    function gerarRelatorio() {
        // Cabeçalho
        const assistida = assistidaInput.value || '[Nome da Assistida]';
        const cuidadora = cuidadoraInput.value || '[Nome da Cuidadora]';

        // Formatar data
        let dataObj;
        if (dataInput.value) {
            // Solução que evita problemas de fuso horário
            const [ano, mes, dia] = dataInput.value.split('-').map(Number);
            dataObj = new Date(ano, mes - 1, dia); // O mês em JavaScript é base 0 (jan=0, fev=1)
        } else {
            dataObj = new Date();
        }

        const dia = padZero(dataObj.getDate());
        const mes = padZero(dataObj.getMonth() + 1);
        const ano = dataObj.getFullYear().toString().substr(-2);
        const dataFormatada = `${dia}/${mes}/${ano}`;

        // Construir o relatório
        let relatorio = `🗓️ RELATÓRIO DO DIA: ${dataFormatada}\n`;
        relatorio += `🏥 ASSISTIDA: ${assistida}\n`;
        relatorio += `👩‍⚕️ CUIDADORA: ${cuidadora}\n\n`;

        // Seção Manhã
        if (eventosManha.children.length > 0) {
            relatorio += `MANHÃ:\n`;
            Array.from(eventosManha.children).forEach(evento => {
                const hora = evento.querySelector('.evento-hora').textContent;
                const tipoIcone = evento.querySelector('.evento-tipo').textContent.trim().split(' ')[0];
                const descricao = evento.querySelector('.evento-descricao').textContent;
                relatorio += `${hora} ${tipoIcone} ${descricao}\n`;
            });
            relatorio += '\n';
        }

        // Seção Tarde
        if (eventosTarde.children.length > 0) {
            relatorio += `TARDE:\n`;
            Array.from(eventosTarde.children).forEach(evento => {
                const hora = evento.querySelector('.evento-hora').textContent;
                const tipoIcone = evento.querySelector('.evento-tipo').textContent.trim().split(' ')[0];
                const descricao = evento.querySelector('.evento-descricao').textContent;
                relatorio += `${hora} ${tipoIcone} ${descricao}\n`;
            });
            relatorio += '\n';
        }

        // Seção Noite
        if (eventosNoite.children.length > 0) {
            relatorio += `NOITE:\n`;
            Array.from(eventosNoite.children).forEach(evento => {
                const hora = evento.querySelector('.evento-hora').textContent;
                const tipoIcone = evento.querySelector('.evento-tipo').textContent.trim().split(' ')[0];
                const descricao = evento.querySelector('.evento-descricao').textContent;
                relatorio += `${hora} ${tipoIcone} ${descricao}\n`;
            });
            relatorio += '\n';
        }

        // Observações
        if (observacoesInput.value.trim()) {
            relatorio += `OBSERVAÇÕES IMPORTANTES:\n${observacoesInput.value.trim()}\n`;
        }

        return relatorio;
    }

    function downloadRelatorio() {
        const relatorio = gerarRelatorio();

        // Obter a data para o nome do arquivo
        let dataObj;
        if (dataInput.value) {
            // Solução que evita problemas de fuso horário
            const [ano, mes, dia] = dataInput.value.split('-').map(Number);
            dataObj = new Date(ano, mes - 1, dia); // O mês em JavaScript é base 0
        } else {
            dataObj = new Date();
        }

        const dia = padZero(dataObj.getDate());
        const mes = padZero(dataObj.getMonth() + 1);
        const ano = dataObj.getFullYear().toString().substr(-2);

        // Criar o nome do arquivo
        const nomeArquivo = `relatorio_${dia}-${mes}-${ano}.txt`;

        // Criar blob e link para download
        const blob = new Blob([relatorio], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();

        // Limpar
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Adicionar feedback visual para campos
    const inputFields = document.querySelectorAll('input, select, textarea');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Eventos de teclado para acessibilidade
    document.addEventListener('keydown', function(e) {
        // Fechar modais com Escape
        if (e.key === 'Escape') {
            if (previewModal.style.display === 'block') fecharModal(previewModal);
            if (eventoModal.style.display === 'block') fecharModal(eventoModal);
        }
    });

    // Chamar a função de ajuste no redimensionamento da janela
    window.addEventListener('resize', ajustarModalMobile);
});
