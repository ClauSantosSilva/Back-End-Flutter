const usuario_id = 2; // ID do cliente (substituir pelo ID real do login)

// Carregar lista de serviços
async function carregarServicos() {
    const response = await fetch("http://localhost:3000/servicos");
    const servicos = await response.json();

    const lista = document.getElementById("listaServicos");
    const selectServico = document.getElementById("servicoSelecionado");

    lista.innerHTML = "";
    selectServico.innerHTML = "<option value=''>Selecione um serviço</option>";

    servicos.forEach(servico => {
        // Adiciona serviço na lista
        const item = document.createElement("li");
        item.textContent = `${servico.servico} - R$${servico.valor}`;
        lista.appendChild(item);

        // Adiciona serviço no select
        const option = document.createElement("option");
        option.value = servico.id;
        option.textContent = servico.servico;
        selectServico.appendChild(option);
    });
}

// Carregar horários disponíveis
async function carregarHorarios() {
    const response = await fetch("http://localhost:3000/agenda");
    const horarios = await response.json();

    const selectHorario = document.getElementById("horarioSelecionado");
    selectHorario.innerHTML = "<option value=''>Selecione um horário</option>";

    horarios.forEach(horario => {
        const option = document.createElement("option");
        option.value = `${horario.data} ${horario.hora}`;
        option.textContent = `${horario.data} às ${horario.hora}`;
        selectHorario.appendChild(option);
    });
}

// Agendamento de serviço
document.getElementById("formAgendamento").addEventListener("submit", async function (e) {
    e.preventDefault();

    const servicos_id = document.getElementById("servicoSelecionado").value;
    const [data, hora] = document.getElementById("horarioSelecionado").value.split(" ");

    if (!servicos_id || !data || !hora) {
        alert("Por favor, selecione um serviço e um horário.");
        return;
    }

    const response = await fetch("http://localhost:3000/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id, servicos_id, data, hora }),
    });

    const dataResponse = await response.json();
    alert(dataResponse.message);
});

// Carregar dados ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
    carregarServicos();
    carregarHorarios();
});
