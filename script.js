// Variáveis globais para os gráficos
let growthChart = null;
let comparisonChart = null;

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE TABELAS
// ============================================

/**
 * Adiciona uma nova linha à tabela de aportes recorrentes
 */
function addRecurringRow() {
    const tbody = document.querySelector('#recurringDepositsTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="number" class="deposit-value" placeholder="0,00" min="0" step="0.01"></td>
        <td>
            <select class="deposit-month">
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
            </select>
        </td>
        <td><button class="btn-remove" onclick="removeRecurringRow(this)">Remover</button></td>
    `;
    tbody.appendChild(newRow);
}

/**
 * Remove uma linha da tabela de aportes recorrentes
 */
function removeRecurringRow(button) {
    const tbody = document.querySelector('#recurringDepositsTable tbody');
    if (tbody.rows.length > 1) {
        button.closest('tr').remove();
    } else {
        alert('Você deve manter pelo menos uma linha na tabela de aportes recorrentes.');
    }
}

/**
 * Adiciona uma nova linha à tabela de aportes únicos
 */
function addOneTimeRow() {
    const tbody = document.querySelector('#oneTimeDepositsTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="number" class="deposit-value" placeholder="0,00" min="0" step="0.01"></td>
        <td>
            <select class="deposit-month">
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
            </select>
        </td>
        <td><input type="number" class="deposit-year" placeholder="2024" min="2000" step="1"></td>
        <td><button class="btn-remove" onclick="removeOneTimeRow(this)">Remover</button></td>
    `;
    tbody.appendChild(newRow);
}

/**
 * Remove uma linha da tabela de aportes únicos
 */
function removeOneTimeRow(button) {
    const tbody = document.querySelector('#oneTimeDepositsTable tbody');
    if (tbody.rows.length > 1) {
        button.closest('tr').remove();
    } else {
        alert('Você deve manter pelo menos uma linha na tabela de aportes únicos.');
    }
}

// ============================================
// FUNÇÕES DE LEITURA DE DADOS
// ============================================

/**
 * Lê os parâmetros de investimento do formulário
 */
function getInvestmentParameters() {
    const initialValue = parseFloat(document.getElementById('initialValue').value) || 0;
    const monthlyDeposit = parseFloat(document.getElementById('monthlyDeposit').value) || 0;
    const monthlyRate = parseFloat(document.getElementById('monthlyRate').value) || 0;
    const startDate = document.getElementById('startDate').value;
    const years = parseInt(document.getElementById('years').value) || 1;

    // Parsear data inicial (formato: YYYY-MM)
    const [startYear, startMonth] = startDate.split('-').map(Number);

    return {
        initialValue,
        monthlyDeposit,
        monthlyRate: monthlyRate / 100, // Converter para decimal
        startYear,
        startMonth,
        years
    };
}

/**
 * Lê os aportes recorrentes da tabela
 */
function getRecurringDeposits() {
    const rows = document.querySelectorAll('#recurringDepositsTable tbody tr');
    const deposits = [];

    rows.forEach(row => {
        const value = parseFloat(row.querySelector('.deposit-value').value) || 0;
        const month = parseInt(row.querySelector('.deposit-month').value);

        if (value > 0) {
            deposits.push({ value, month });
        }
    });

    return deposits;
}

/**
 * Lê os aportes únicos da tabela
 */
function getOneTimeDeposits() {
    const rows = document.querySelectorAll('#oneTimeDepositsTable tbody tr');
    const deposits = [];

    rows.forEach(row => {
        const value = parseFloat(row.querySelector('.deposit-value').value) || 0;
        const month = parseInt(row.querySelector('.deposit-month').value);
        const year = parseInt(row.querySelector('.deposit-year').value);

        if (value > 0 && year > 0) {
            deposits.push({ value, month, year });
        }
    });

    return deposits;
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula o aporte total para um mês específico
 */
function calculateMonthlyDeposit(month, year, monthlyDeposit, recurringDeposits, oneTimeDeposits) {
    let totalDeposit = monthlyDeposit;

    // Adicionar aportes recorrentes
    recurringDeposits.forEach(deposit => {
        if (deposit.month === month) {
            totalDeposit += deposit.value;
        }
    });

    // Adicionar aportes únicos
    oneTimeDeposits.forEach(deposit => {
        if (deposit.month === month && deposit.year === year) {
            totalDeposit += deposit.value;
        }
    });

    return totalDeposit;
}

/**
 * Gera a simulação completa de investimentos
 */
function generateSimulation() {
    // Validar entrada
    const params = getInvestmentParameters();
    if (params.years <= 0) {
        alert('O número de anos deve ser maior que 0.');
        return;
    }

    const recurringDeposits = getRecurringDeposits();
    const oneTimeDeposits = getOneTimeDeposits();

    // Inicializar arrays para armazenar dados
    const simulationData = [];
    let currentBalance = params.initialValue;
    let totalInvested = params.initialValue;
    let totalInterest = 0;

    // Calcular mês a mês
    const totalMonths = params.years * 12;
    let currentMonth = params.startMonth;
    let currentYear = params.startYear;

    for (let i = 0; i < totalMonths; i++) {
        // Calcular aporte do mês
        const monthlyDeposit = calculateMonthlyDeposit(
            currentMonth,
            currentYear,
            params.monthlyDeposit,
            recurringDeposits,
            oneTimeDeposits
        );

        // Saldo inicial
        const initialBalance = currentBalance;

        // Aplicação (aporte)
        const application = monthlyDeposit;

        // Juros sobre (saldo inicial + aplicação)
        const interest = (initialBalance + application) * params.monthlyRate;

        // Saldo final
        currentBalance = initialBalance + application + interest;

        // Atualizar totalizadores
        totalInvested += monthlyDeposit;
        totalInterest += interest;

        // Armazenar dados do mês
        simulationData.push({
            month: currentMonth,
            year: currentYear,
            initialBalance,
            application,
            interest,
            finalBalance: currentBalance
        });

        // Avançar para o próximo mês
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    // Renderizar resultados
    renderTable(simulationData);
    renderCharts(simulationData);
    renderSummary(totalInvested, totalInterest, currentBalance, params.initialValue);

    // Mostrar seção de resultados
    document.getElementById('resultsSection').style.display = 'block';

    // Scroll para resultados
    setTimeout(() => {
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================

/**
 * Renderiza a tabela de resultados
 */
function renderTable(data) {
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = '';

    data.forEach((row, index) => {
        const monthName = getMonthName(row.month);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${monthName} ${row.year}</td>
            <td>${formatCurrency(row.initialBalance)}</td>
            <td>${formatCurrency(row.application)}</td>
            <td>${formatCurrency(row.interest)}</td>
            <td>${formatCurrency(row.finalBalance)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza os gráficos usando Chart.js
 */
function renderCharts(data) {
    // Preparar dados para os gráficos
    const labels = data.map(row => `${getMonthShortName(row.month)}/${row.year}`);
    const finalBalances = data.map(row => row.finalBalance);

    // Calcular totais acumulados
    let accumulatedInvested = parseFloat(document.getElementById('initialValue').value) || 0;
    let accumulatedInterest = 0;

    const investedData = [];
    const interestData = [];

    data.forEach(row => {
        accumulatedInvested += row.application;
        accumulatedInterest += row.interest;

        investedData.push(accumulatedInvested);
        interestData.push(accumulatedInterest);
    });

    // Destruir gráficos anteriores se existirem
    if (growthChart) {
        growthChart.destroy();
    }
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    // Gráfico 1: Crescimento do Patrimônio
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Saldo Final',
                data: finalBalances,
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#1a73e8',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        color: '#333'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                        },
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Gráfico 2: Comparação Investido vs. Juros
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(comparisonCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Investido',
                    data: investedData,
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointBackgroundColor: '#34a853',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Total de Juros',
                    data: interestData,
                    borderColor: '#ea4335',
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointBackgroundColor: '#ea4335',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        color: '#333'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                        },
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Renderiza o resumo final
 */
function renderSummary(totalInvested, totalInterest, finalBalance, initialValue) {
    document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('finalBalance').textContent = formatCurrency(finalBalance);

    // Calcular rentabilidade
    const profitability = initialValue > 0 ? ((finalBalance - initialValue) / initialValue) * 100 : 0;
    document.getElementById('profitability').textContent = profitability.toFixed(2) + '%';
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Formata um número como moeda brasileira
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Retorna o nome completo do mês
 */
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
}

/**
 * Retorna o nome abreviado do mês
 */
function getMonthShortName(month) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1];
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Executar simulação ao carregar a página (com valores padrão)
document.addEventListener('DOMContentLoaded', function () {
    // Opcional: executar simulação automaticamente ao carregar
    // generateSimulation();
});
