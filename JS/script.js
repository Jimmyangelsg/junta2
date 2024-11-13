let participants = [];
let expenses = [];

function loadData() {
    const savedParticipants = localStorage.getItem('participants');
    const savedExpenses = localStorage.getItem('expenses');
    if (savedParticipants) {
        participants = JSON.parse(savedParticipants);
        updateParticipantsList();
        updatePayerSelect();
    }
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
        updateExpensesList();
    }
}

function saveData() {
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function clearData() {
    localStorage.removeItem('participants');
    localStorage.removeItem('expenses');
    participants = [];
    expenses = [];
    updateParticipantsList();
    updateExpensesList();
    document.getElementById('result').innerHTML = '';
    document.getElementById('summary').innerHTML = '';
}

function isValidName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
}

function addParticipant() {
    const name = document.getElementById('participant-name').value.trim();
    const errorDiv = document.getElementById('participant-error');
    errorDiv.innerHTML = '';

    if (name) {
        if (!isValidName(name)) {
            errorDiv.innerHTML = 'El nombre no debe contener números ni símbolos.';
            return;
        }
        if (participants.includes(name)) {
            errorDiv.innerHTML = 'El participante ya ha sido agregado.';
            return;
        }
        participants.push(name);
        document.getElementById('participant-name').value = '';
        updateParticipantsList();
        updatePayerSelect();
        saveData();
    } else {
        errorDiv.innerHTML = 'Por favor, ingrese un nombre de participante válido.';
    }
}

function updateParticipantsList() {
    const participantsList = document.getElementById('participants-list');
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = participant;
        participantsList.appendChild(li);
    });
}

function updatePayerSelect() {
    const payerSelect = document.getElementById('expense-payer');
    payerSelect.innerHTML = '<option value="">Seleccione el pagador</option>';
    participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant;
        option.textContent = participant;
        payerSelect.appendChild(option);
    });
}

function addExpense() {
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value.trim());
    const payer = document.getElementById('expense-payer').value;
    if (description && !isNaN(amount) && amount > 0 && payer) {
        expenses.push({ description, amount, payer });
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-payer').value = '';
        updateExpensesList();
        saveData();
    } else {
        alert('Por favor, ingrese una descripción de gasto válida, monto y pagador.');
    }
}

function updateExpensesList() {
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = '';
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.description}: $${expense.amount.toFixed(2)} pagado por ${expense.payer}`;
        expensesList.appendChild(li);
    });
}

function calculateSplit() {
    if (participants.length === 0 || expenses.length === 0) {
        alert('Por favor, agregue participantes y gastos.');
        return;
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const splitAmount = totalAmount / participants.length;

    let balances = {};
    participants.forEach(participant => {
        balances[participant] = 0;
    });

    expenses.forEach(expense => {
        balances[expense.payer] += expense.amount;
    });

    let debts = {};
    participants.forEach(participant => {
        debts[participant] = balances[participant] - splitAmount;
    });

    let payments = simplifyDebts(debts);

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Cada participante debe pagar: $${splitAmount.toFixed(2)}</h3>`;
    payments.forEach(payment => {
        resultDiv.innerHTML += `<p>${payment[0]} debe pagar ${payment[2].toFixed(2)} pesos a ${payment[1]}.</p>`;
    });

    // Calcular el total gastado por cada participante
    let totalSpent = {};
    participants.forEach(participant => {
        totalSpent[participant] = 0;
    });

    expenses.forEach(expense => {
        totalSpent[expense.payer] += expense.amount;
    });

    // Mostrar el total gastado por cada participante
    resultDiv.innerHTML += `<h3>Total gastado por cada participante:</h3>`;
    participants.forEach(participant => {
        resultDiv.innerHTML += `<p>${participant}: $${totalSpent[participant].toFixed(2)}</p>`;
    });

    // Mostrar resumen de gastos
    const summaryDiv = document.getElementById('summary');
    summaryDiv.innerHTML = `<h3>Resumen de gastos:</h3>`;
    summaryDiv.innerHTML += `<p>Total gastado: $${totalAmount.toFixed(2)}</p>`;
    summaryDiv.innerHTML += `<p>Promedio por participante: $${(totalAmount / participants.length).toFixed(2)}</p>`;
}

function simplifyDebts(debts) {
    let creditors = {};
    let debtors = {};

    participants.forEach(participant => {
        if (debts[participant] > 0) {
            creditors[participant] = debts[participant];
        } else if (debts[participant] < 0) {
            debtors[participant] = -debts[participant];
        }
    });

    let payments = [];

    for (let debtor in debtors) {
        let debt = debtors[debtor];
        for (let creditor in creditors) {
            if (debt == 0) break;
            let credit = creditors[creditor];
            let paymentAmount = Math.min(debt, credit);
            payments.push([debtor, creditor, paymentAmount]);
            debt -= paymentAmount;
            creditors[creditor] -= paymentAmount;
            if (creditors[creditor] == 0) {
                delete creditors[creditor];
            }
        }
    }

    return payments;
}

function toggleLanguage() {
    const lang = document.documentElement.lang;
    if (lang === 'es') {
        document.documentElement.lang = 'en';
        document.querySelector('header h1').textContent = 'Junta2';
        document.querySelector('header p').textContent = 'Welcome to Junta2, the expense splitting calculator among friends.';
        document.querySelector('header button').textContent = 'Change Language';
        document.querySelector('#participants-section h2').textContent = 'Participants';
        document.querySelector('#participant-name').placeholder = 'Enter participant name';
        document.querySelector('#participants-section button').textContent = 'Add Participant';
        document.querySelector('#expenses-section h2').textContent = 'Expenses';
        document.querySelector('#expense-description').placeholder = 'Enter expense description';
        document.querySelector('#expense-amount').placeholder = 'Enter expense amount';
        document.querySelector('#expense-payer').placeholder = 'Select payer';
        document.querySelector('#expenses-section button').textContent = 'Add Expense';
        document.querySelector('button[aria-label="Calcular división"]').textContent = 'Calculate Split';
        document.querySelector('button[aria-label="Limpiar datos"]').textContent = 'Clear Data';
        document.querySelector('footer p').textContent = '© 2024 Junta2. Application created by Jimmy Segovia. All rights reserved.';
    } else {
        document.documentElement.lang = 'es';
        document.querySelector('header h1').textContent = 'Junta2';
        document.querySelector('header p').textContent = 'Bienvenido a Junta2, la calculadora de división de gastos entre amigos.';
        document.querySelector('header button').textContent = 'Cambiar idioma';
        document.querySelector('#participants-section h2').textContent = 'Participantes';
        document.querySelector('#participant-name').placeholder = 'Ingrese el nombre del participante';
        document.querySelector('#participants-section button').textContent = 'Agregar Participante';
        document.querySelector('#expenses-section h2').textContent = 'Gastos';
        document.querySelector('#expense-description').placeholder = 'Ingrese la descripción del gasto';
        document.querySelector('#expense-amount').placeholder = 'Ingrese el monto del gasto';
        document.querySelector('#expense-payer').placeholder = 'Seleccione el pagador';
        document.querySelector('#expenses-section button').textContent = 'Agregar Gasto';
        document.querySelector('button[aria-label="Calcular división"]').textContent = 'Calcular División';
        document.querySelector('button[aria-label="Limpiar datos"]').textContent = 'Limpiar Datos';
        document.querySelector('footer p').textContent = '© 2024 Junta2. Aplicación creada por Jimmy Segovia. Todos los derechos reservados.';
    }
}

document.addEventListener('DOMContentLoaded', loadData);

document.getElementById('participant-name').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addParticipant();
    }
});

document.getElementById('expense-description').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addExpense();
    }
});

document.getElementById('expense-amount').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addExpense();
    }
});
