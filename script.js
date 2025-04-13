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
    const sinaisVitaisSection = document.getElementById('sinaisVitaisSection');
    const higieneSection = document.getElementById('higieneSection');
    const selectedTimesPreview = document.getElementById('selectedTimesPreview');

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

    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    // Eventos de adicionar eventos por período
    btnAddEventoManhaEl.addEventListener('click', () => abrirModalEvento('MANHÃ'));
    btnAddEventoTardeEl.addEventListener('click', () => abrirModalEvento('TARDE'));
    btnAddEventoNoiteEl.addEventListener('click', () => abrirModalEvento('NOITE'));

    // Botões de horário para seleção múltipla
    const botoesHorario = document.querySelectorAll('.btn-horario');

    botoesHorario.forEach(btn => {
        btn.addEventListener('click', function() {
            // Toggle seleção (permitir múltipla seleção)
            this.classList.toggle('selected');

            // Animar o botão
            animarSelecao(this);

            // Atualizar preview dos horários selecionados
            atualizarPreviewHorarios();
        });
    });

    // Atualizar preview dos horários selecionados
    function atualizarPreviewHorarios() {
        const horariosSelecionados = getSelectedTimes();

        if (horariosSelecionados.length > 0) {
            selectedTimesPreview.textContent = `Horários selecionados: ${horariosSelecionados.join(', ')}`;
            selectedTimesPreview.style.display = 'block';
        } else {
            selectedTimesPreview.textContent = '';
            selectedTimesPreview.style.display = 'none';
        }
    }

    // Obter todos os horários selecionados
    function getSelectedTimes() {
        const selectedButtons = document.querySelectorAll('.btn-horario.selected');
        const times = Array.from(selectedButtons).map(btn => btn.getAttribute('data-hora'));

        // Adicionar horário personalizado se inserido
        if (horaPersonalizadaInput.value) {
            times.push(horaPersonalizadaInput.value);
        }

        return times;
    }

    // Animar seleção de botão
    function animarSelecao(elemento) {
        elemento.style.transform = 'scale(1.05)';
        setTimeout(() => {
            elemento.style.transform = '';
        }, 200);
    }

    // Ao digitar no horário personalizado, atualizar preview
    horaPersonalizadaInput.addEventListener('input', function() {
        atualizarPreviewHorarios();
    });

    // Mostrar/esconder seções baseado no tipo de evento
    tipoEventoSelect.addEventListener('change', function() {
        if (this.value === '🏥 Sinais Vitais') {
            sinaisVitaisSection.style.display = 'block';
            higieneSection.style.display = 'none';
        } else if (this.value === '🚿 Higiene') {
            higieneSection.style.display = 'block';
            sinaisVitaisSection.style.display = 'none';
        } else {
            sinaisVitaisSection.style.display = 'none';
            higieneSection.style.display = 'none';
        }

        // Limpar campos quando o tipo é alterado
        if (this.value !== '🏥 Sinais Vitais') {
            // Limpar campos de sinais vitais
            document.getElementById('pressaoArterialMax').value = '';
            document.getElementById('pressaoArterialMin').value = '';
            document.getElementById('spo2').value = '';
            document.getElementById('frequenciaCardiaca').value = '';
            document.getElementById('temperatura').value = '';
        }

        if (this.value !== '🚿 Higiene') {
            // Limpar campos de higiene
            document.getElementById('evacuacao').value = '';
            document.getElementById('urinacao').value = '';
        }
    });

    // Salvar evento
    btnSalvarEvento.addEventListener('click', function() {
        const periodo = periodoEventoInput.value;
        const tipo = tipoEventoSelect.value;
        const descricao = descricaoEventoTextarea.value;

        // Obter todos os horários selecionados
        const horariosSelecionados = getSelectedTimes();

        if (horariosSelecionados.length === 0 || !tipo || !descricao) {
            exibirNotificacao('Por favor, preencha todos os campos obrigatórios: horário, tipo e descrição.', 'error');
            return;
        }

        // Coletar dados de sinais vitais se aplicável
        let sinaisVitais = null;
        if (tipo === '🏥 Sinais Vitais') {
            const pressaoMax = document.getElementById('pressaoArterialMax').value;
            const pressaoMin = document.getElementById('pressaoArterialMin').value;
            const spo2 = document.getElementById('spo2').value;
            const fc = document.getElementById('frequenciaCardiaca').value;
            const temp = document.getElementById('temperatura').value;

            sinaisVitais = {
                pressaoArterial: pressaoMax && pressaoMin ? `${pressaoMax}/${pressaoMin}` : '',
                spo2: spo2 ? `${spo2}%` : '',
                frequenciaCardiaca: fc ? `${fc} BPM` : '',
                temperatura: temp ? `${temp}°C` : ''
            };
        }

        // Coletar dados de higiene se aplicável
        let higiene = null;
        if (tipo === '🚿 Higiene') {
            const evacuacao = document.getElementById('evacuacao').value;
            const urinacao = document.getElementById('urinacao').value;

            higiene = {
                evacuacao: evacuacao || '',
                urinacao: urinacao || ''
            };
        }

        if (modoEdicao && eventoEmEdicao) {
            // Atualizar evento existente
            atualizarEvento(eventoEmEdicao, horariosSelecionados[0], tipo, descricao, sinaisVitais, higiene);
            exibirNotificacao('Evento atualizado com sucesso!', 'success');
        } else {
            // Adicionar novos eventos para cada horário selecionado
            horariosSelecionados.forEach(hora => {
                adicionarEvento(periodo, hora, tipo, descricao, sinaisVitais, higiene);
            });
            exibirNotificacao(`${horariosSelecionados.length > 1 ? 'Eventos adicionados' : 'Evento adicionado'} com sucesso!`, 'success');
        }

        // Limpar e fechar modal
        tipoEventoSelect.value = '';
        descricaoEventoTextarea.value = '';
        botoesHorario.forEach(b => b.classList.remove('selected'));
        horaPersonalizadaInput.value = '';
        selectedTimesPreview.textContent = '';
        selectedTimesPreview.style.display = 'none';

        // Limpar campos de sinais vitais
        document.getElementById('pressaoArterialMax').value = '';
        document.getElementById('pressaoArterialMin').value = '';
        document.getElementById('spo2').value = '';
        document.getElementById('frequenciaCardiaca').value = '';
        document.getElementById('temperatura').value = '';

        // Limpar campos de higiene
        document.getElementById('evacuacao').value = '';
        document.getElementById('urinacao').value = '';

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
        tipoEventoSelect.value = '';
        descricaoEventoTextarea.value = '';
        selectedTimesPreview.textContent = '';
        selectedTimesPreview.style.display = 'none';

        // Esconder seções especiais
        sinaisVitaisSection.style.display = 'none';
        higieneSection.style.display = 'none';

        // Limpar campos de sinais vitais
        document.getElementById('pressaoArterialMax').value = '';
        document.getElementById('pressaoArterialMin').value = '';
        document.getElementById('spo2').value = '';
        document.getElementById('frequenciaCardiaca').value = '';
        document.getElementById('temperatura').value = '';

        // Limpar campos de higiene
        document.getElementById('evacuacao').value = '';
        document.getElementById('urinacao').value = '';

        // Resetar modo de edição
        modoEdicao = false;
        eventoEmEdicao = null;

        abrirModal(eventoModal);
    }

    function adicionarEvento(periodo, hora, tipo, descricao, sinaisVitais = null, higiene = null) {
        const eventoContainer = periodo === 'MANHÃ' ? eventosManha : periodo === 'TARDE' ? eventosTarde : eventosNoite;
        const tipoIcone = getIconeParaTipo(tipo);
        const tipoNome = getTipoNome(tipo);

        const eventoCard = document.createElement('div');
        eventoCard.className = 'evento-card';
        eventoCard.setAttribute('data-hora', hora);
        eventoCard.setAttribute('data-tipo', tipo);
        eventoCard.setAttribute('data-descricao', descricao);
        eventoCard.setAttribute('data-periodo', periodo);

        // Adicionar dados de sinais vitais se disponíveis
        if (sinaisVitais) {
            eventoCard.setAttribute('data-sinais-vitais', JSON.stringify(sinaisVitais));
        }

        // Adicionar dados de higiene se disponíveis
        if (higiene) {
            eventoCard.setAttribute('data-higiene', JSON.stringify(higiene));
        }

        // Criar conteúdo para o card
        let conteudo = `
            <div class="evento-hora">${hora}</div>
            <div class="evento-tipo">${tipoIcone} ${tipoNome}</div>
            <div class="evento-descricao">${descricao}</div>
        `;

        // Adicionar detalhes de sinais vitais se disponíveis
        if (sinaisVitais) {
            let sinaisVitaisHtml = '<div class="sinais-vitais-details">';

            if (sinaisVitais.pressaoArterial) {
                sinaisVitaisHtml += `<div>P.A.: ${sinaisVitais.pressaoArterial}</div>`;
            }

            if (sinaisVitais.spo2) {
                sinaisVitaisHtml += `<div>SPO²: ${sinaisVitais.spo2}</div>`;
            }

            if (sinaisVitais.frequenciaCardiaca) {
                sinaisVitaisHtml += `<div>F.C.: ${sinaisVitais.frequenciaCardiaca}</div>`;
            }

            if (sinaisVitais.temperatura) {
                sinaisVitaisHtml += `<div>Temperatura: ${sinaisVitais.temperatura}</div>`;
            }

            sinaisVitaisHtml += '</div>';
            conteudo += sinaisVitaisHtml;
        }

        // Adicionar detalhes de higiene se disponíveis
        if (higiene) {
            let higieneHtml = '<div class="higiene-details">';

            if (higiene.evacuacao) {
                higieneHtml += `<div>Evacuação: ${higiene.evacuacao}</div>`;
            }

            if (higiene.urinacao) {
                higieneHtml += `<div>Urinação: ${higiene.urinacao}</div>`;
            }

            higieneHtml += '</div>';
            conteudo += higieneHtml;
        }

        // Adicionar botões de ação
        conteudo += `
            <div class="evento-acoes">
                <button class="btn-editar-evento" title="Editar evento">✎</button>
                <button class="btn-remover-evento" title="Remover evento">×</button>
            </div>
        `;

        eventoCard.innerHTML = conteudo;

        // Adicionar event listeners para editar e remover
        eventoCard.querySelector('.btn-editar-evento').addEventListener('click', () => editarEvento(eventoCard));
        eventoCard.querySelector('.btn-remover-evento').addEventListener('click', () => removerEvento(eventoCard));

        // Inserir o card na posição correta com base no horário
        inserirCardOrdenado(eventoContainer, eventoCard);
    }

    function inserirCardOrdenado(container, novoCard) {
        const hora = novoCard.getAttribute('data-hora');
        const cardsExistentes = container.querySelectorAll('.evento-card');

        let inserido = false;

        for (let i = 0; i < cardsExistentes.length; i++) {
            const horaExistente = cardsExistentes[i].getAttribute('data-hora');

            if (hora < horaExistente) {
                container.insertBefore(novoCard, cardsExistentes[i]);
                inserido = true;
                break;
            }
        }

        if (!inserido) {
            container.appendChild(novoCard);
        }
    }

    function editarEvento(eventoCard) {
        const periodo = eventoCard.getAttribute('data-periodo');
        const hora = eventoCard.getAttribute('data-hora');
        const tipo = eventoCard.getAttribute('data-tipo');
        const descricao = eventoCard.getAttribute('data-descricao');
        const sinaisVitaisData = eventoCard.getAttribute('data-sinais-vitais');
        const higieneData = eventoCard.getAttribute('data-higiene');

        // Abrir o modal de evento
        abrirModalEvento(periodo);

        // Definir campos
        tipoEventoSelect.value = tipo;
        descricaoEventoTextarea.value = descricao;

        // Selecionar o botão de horário correspondente ou definir horário personalizado
        let encontrouBotao = false;
        botoesHorario.forEach(btn => {
            if (btn.getAttribute('data-hora') === hora) {
                btn.classList.add('selected');
                encontrouBotao = true;
                atualizarPreviewHorarios();
            }
        });

        if (!encontrouBotao) {
            horaPersonalizadaInput.value = hora;
            atualizarPreviewHorarios();
        }

        // Se for um evento de sinais vitais, preencher os campos de sinais vitais
        if (tipo === '🏥 Sinais Vitais' && sinaisVitaisData) {
            const sinaisVitais = JSON.parse(sinaisVitaisData);

            // Mostrar a seção de sinais vitais
            sinaisVitaisSection.style.display = 'block';

            // Preencher campos
            if (sinaisVitais.pressaoArterial) {
                const [max, min] = sinaisVitais.pressaoArterial.split('/');
                document.getElementById('pressaoArterialMax').value = max;
                document.getElementById('pressaoArterialMin').value = min;
            }

            if (sinaisVitais.spo2) {
                document.getElementById('spo2').value = sinaisVitais.spo2.replace('%', '');
            }

            if (sinaisVitais.frequenciaCardiaca) {
                document.getElementById('frequenciaCardiaca').value = sinaisVitais.frequenciaCardiaca.replace(' BPM', '');
            }

            if (sinaisVitais.temperatura) {
                document.getElementById('temperatura').value = sinaisVitais.temperatura.replace('°C', '');
            }
        }

        // Se for um evento de higiene, preencher os campos de higiene
        if (tipo === '🚿 Higiene' && higieneData) {
            const higiene = JSON.parse(higieneData);

            // Mostrar a seção de higiene
            higieneSection.style.display = 'block';

            // Preencher campos
            if (higiene.evacuacao) {
                document.getElementById('evacuacao').value = higiene.evacuacao;
            }

            if (higiene.urinacao) {
                document.getElementById('urinacao').value = higiene.urinacao;
            }
        }

        // Definir modo de edição
        modoEdicao = true;
        eventoEmEdicao = eventoCard;
    }

    function atualizarEvento(eventoCard, hora, tipo, descricao, sinaisVitais = null, higiene = null) {
        const tipoIcone = getIconeParaTipo(tipo);
        const tipoNome = getTipoNome(tipo);

        // Atualizar atributos
        eventoCard.setAttribute('data-hora', hora);
        eventoCard.setAttribute('data-tipo', tipo);
        eventoCard.setAttribute('data-descricao', descricao);

        // Atualizar ou remover dados de sinais vitais
        if (sinaisVitais) {
            eventoCard.setAttribute('data-sinais-vitais', JSON.stringify(sinaisVitais));
        } else {
            eventoCard.removeAttribute('data-sinais-vitais');
        }

        // Atualizar ou remover dados de higiene
        if (higiene) {
            eventoCard.setAttribute('data-higiene', JSON.stringify(higiene));
        } else {
            eventoCard.removeAttribute('data-higiene');
        }

        // Criar conteúdo para o card
        let conteudo = `
            <div class="evento-hora">${hora}</div>
            <div class="evento-tipo">${tipoIcone} ${tipoNome}</div>
            <div class="evento-descricao">${descricao}</div>
        `;

        // Adicionar detalhes de sinais vitais se disponíveis
        if (sinaisVitais) {
            let sinaisVitaisHtml = '<div class="sinais-vitais-details">';

            if (sinaisVitais.pressaoArterial) {
                sinaisVitaisHtml += `<div>P.A.: ${sinaisVitais.pressaoArterial}</div>`;
            }

            if (sinaisVitais.spo2) {
                sinaisVitaisHtml += `<div>SPO²: ${sinaisVitais.spo2}</div>`;
            }

            if (sinaisVitais.frequenciaCardiaca) {
                sinaisVitaisHtml += `<div>F.C.: ${sinaisVitais.frequenciaCardiaca}</div>`;
            }

            if (sinaisVitais.temperatura) {
                sinaisVitaisHtml += `<div>Temperatura: ${sinaisVitais.temperatura}</div>`;
            }

            sinaisVitaisHtml += '</div>';
            conteudo += sinaisVitaisHtml;
        }

        // Adicionar detalhes de higiene se disponíveis
        if (higiene) {
            let higieneHtml = '<div class="higiene-details">';

            if (higiene.evacuacao) {
                higieneHtml += `<div>Evacuação: ${higiene.evacuacao}</div>`;
            }

            if (higiene.urinacao) {
                higieneHtml += `<div>Urinação: ${higiene.urinacao}</div>`;
            }

            higieneHtml += '</div>';
            conteudo += higieneHtml;
        }

        // Adicionar botões de ação
        conteudo += `
            <div class="evento-acoes">
                <button class="btn-editar-evento" title="Editar evento">✎</button>
                <button class="btn-remover-evento" title="Remover evento">×</button>
            </div>
        `;

        eventoCard.innerHTML = conteudo;

        // Readicionar event listeners para editar e remover
        eventoCard.querySelector('.btn-editar-evento').addEventListener('click', () => editarEvento(eventoCard));
        eventoCard.querySelector('.btn-remover-evento').addEventListener('click', () => removerEvento(eventoCard));

        // Reordenar o card se necessário
        const eventoContainer = eventoCard.parentElement;
        eventoCard.remove();
        inserirCardOrdenado(eventoContainer, eventoCard);
    }

    function removerEvento(eventoCard) {
        // Animação de saída
        eventoCard.style.opacity = '0';
        eventoCard.style.transform = 'translateX(20px)';

        // Remover após a animação
        setTimeout(() => {
            eventoCard.remove();
            exibirNotificacao('Evento removido com sucesso!', 'success');
        }, 300);
    }

    function getIconeParaTipo(tipo) {
        return tipo.split(' ')[0];
    }

    function getTipoNome(tipo) {
        return tipo.split(' ').slice(1).join(' ');
    }

    function gerarRelatorio() {
        const assistida = assistidaInput.value || '[Nome da Pessoa Assistida]';
        const cuidadora = cuidadoraInput.value || '[Nome da Cuidadora]';
        const data = formatarData(dataInput.value);
        const observacoes = observacoesInput.value;

        let relatorio = `RELATÓRIO DE CUIDADOS\n`;
        relatorio += `===================\n\n`;
        relatorio += `Data: ${data}\n`;
        relatorio += `Pessoa Assistida: ${assistida}\n`;
        relatorio += `Cuidadora: ${cuidadora}\n\n`;

        // Eventos da manhã
        relatorio += `PERÍODO DA MANHÃ:\n`;
        relatorio += `----------------\n`;
        const eventosManhaTxt = gerarTextoEventos(eventosManha);
        relatorio += eventosManhaTxt || 'Nenhum evento registrado.\n';
        relatorio += '\n';

        // Eventos da tarde
        relatorio += `PERÍODO DA TARDE:\n`;
        relatorio += `----------------\n`;
        const eventosTardeTxt = gerarTextoEventos(eventosTarde);
        relatorio += eventosTardeTxt || 'Nenhum evento registrado.\n';
        relatorio += '\n';

        // Eventos da noite
        relatorio += `PERÍODO DA NOITE:\n`;
        relatorio += `----------------\n`;
        const eventosNoiteTxt = gerarTextoEventos(eventosNoite);
        relatorio += eventosNoiteTxt || 'Nenhum evento registrado.\n';
        relatorio += '\n';

        // Observações
        relatorio += `OBSERVAÇÕES GERAIS:\n`;
        relatorio += `------------------\n`;
        relatorio += observacoes || 'Nenhuma observação registrada.';

        return relatorio;
    }

    function gerarTextoEventos(container) {
        const eventos = container.querySelectorAll('.evento-card');
        if (eventos.length === 0) return '';

        let texto = '';
        eventos.forEach(evento => {
            const hora = evento.getAttribute('data-hora');
            const tipo = evento.getAttribute('data-tipo');
            const descricao = evento.getAttribute('data-descricao');
            const sinaisVitaisData = evento.getAttribute('data-sinais-vitais');
            const higieneData = evento.getAttribute('data-higiene');

            texto += `[${hora}] ${tipo}: ${descricao}\n`;

            // Adicionar informações de sinais vitais se disponíveis
            if (sinaisVitaisData) {
                const sinaisVitais = JSON.parse(sinaisVitaisData);
                if (sinaisVitais.pressaoArterial) {
                    texto += `    - P.A.: ${sinaisVitais.pressaoArterial}\n`;
                }
                if (sinaisVitais.spo2) {
                    texto += `    - SPO²: ${sinaisVitais.spo2}\n`;
                }
                if (sinaisVitais.frequenciaCardiaca) {
                    texto += `    - F.C.: ${sinaisVitais.frequenciaCardiaca}\n`;
                }
                if (sinaisVitais.temperatura) {
                    texto += `    - Temperatura: ${sinaisVitais.temperatura}\n`;
                }
            }

            // Adicionar informações de higiene se disponíveis
            if (higieneData) {
                const higiene = JSON.parse(higieneData);
                if (higiene.evacuacao) {
                    texto += `    - Evacuação: ${higiene.evacuacao}\n`;
                }
                if (higiene.urinacao) {
                    texto += `    - Urinação: ${higiene.urinacao}\n`;
                }
            }
        });

        return texto;
    }

    function formatarData(dataISO) {
        if (!dataISO) return '';

        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function downloadRelatorio() {
        const relatorio = gerarRelatorio();
        const assistida = assistidaInput.value || 'pessoa-assistida';
        const data = dataInput.value || new Date().toISOString().split('T')[0];
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });

        // Criar link para download
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `relatorio-${assistida}-${data}.txt`;
        document.body.appendChild(a);
        a.click();

        // Limpar
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
});
