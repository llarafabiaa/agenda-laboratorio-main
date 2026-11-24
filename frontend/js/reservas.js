API.exigirLogin();

const usuario = API.usuario();
if (usuario?.perfil !== 'ADMIN') {
  document.querySelector('#link-bloqueios')?.remove();
}
document.querySelector('#nome-usuario').textContent =
  usuario?.nome || 'Usuario';
document.querySelector('#perfil-usuario').textContent =
  usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Professor';
document.querySelector('#avatar').textContent = (usuario?.nome || 'U')
  .charAt(0)
  .toUpperCase();
document.querySelector('#logout').addEventListener('click', () => API.sair());

const nomesDias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const nomesMeses = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];
let horarios = [];
let reservas = [];
let bloqueios = [];
let semanaInicial = inicioDaSemana(new Date());
let dataSelecionada = null;
const periodosSelecionados = new Set();

function inicioDaSemana(data) {
  const resultado = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
  );
  const dia = resultado.getDay();
  resultado.setDate(resultado.getDate() - (dia === 0 ? 6 : dia - 1));
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function isoLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function dataDaReserva(valor) {
  return typeof valor === 'string' ? valor.substring(0, 10) : isoLocal(valor);
}

async function carregarDados() {
  [horarios, reservas, bloqueios] = await Promise.all([
    API.requisicao('/api/reservas/horarios'),
    API.requisicao('/api/reservas'),
    API.requisicao('/api/bloqueios'),
  ]);
  reservas = reservas.map((item) => ({
    ...item,
    usuario_nome: item.usuario_nome || item.nome_usuario || 'Professor',
  }));
  renderizarAgenda();
  renderizarReservas();
}

function renderizarAgenda() {
  const grid = document.querySelector('#calendar-grid');
  const dias = Array.from({ length: 7 }, (_, indice) => {
    const data = new Date(semanaInicial);
    data.setDate(data.getDate() + indice);
    return data;
  });

  const inicioTexto = dias[0].toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
  const fimTexto = dias[6].toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  document.querySelector('#titulo-semana').textContent =
    `${inicioTexto} - ${fimTexto}`;
  document.querySelector('#data-hoje').textContent =
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  let html = '<div class="calendar-header"><small>PERIODO</small></div>';
  dias.forEach((dia) => {
    const hoje = isoLocal(dia) === isoLocal(new Date());
    const fimDeSemana = dia.getDay() === 0 || dia.getDay() === 6;
    html += `<div class="calendar-header ${hoje ? 'hoje' : ''} ${fimDeSemana ? 'fim-de-semana' : ''}">
      <strong>${nomesDias[dia.getDay()]}</strong><small>${dia.getDate()} ${nomesMeses[dia.getMonth()]}</small>
    </div>`;
  });

  horarios.forEach((horario) => {
    html += `<div class="period-label"><strong>Periodo ${horario.numero_periodo}</strong>
      <small>${horario.horario_inicio || '--'} - ${horario.horario_fim || '--'}</small></div>`;

    dias.forEach((dia) => {
      const data = isoLocal(dia);
      const fimDeSemana = dia.getDay() === 0 || dia.getDay() === 6;
      const reservado = reservas.find(
        (item) =>
          item.status === 'ATIVA' &&
          dataDaReserva(item.data_reserva) === data &&
          Number(item.horario_id) === Number(horario.id),
      );
      const bloqueado = bloqueios.some(
        (item) => dataDaReserva(item.data) === data,
      );
      const selecionado = periodosSelecionados.has(`${data}|${horario.id}`);
      const classe = fimDeSemana
        ? ' bloqueado fim-de-semana'
        : reservado
          ? ' ocupado'
          : bloqueado
            ? ' bloqueado'
            : selecionado
              ? ' selecionado'
              : '';
      const estado = fimDeSemana
        ? 'Indisponivel'
        : reservado
          ? 'Reservado'
          : bloqueado
            ? 'Bloqueado'
            : selecionado
              ? 'Selecionado'
              : 'Livre';
      html += `<button type="button" class="calendar-cell${classe}"
        data-data="${data}" data-horario="${horario.id}" ${fimDeSemana || reservado || bloqueado ? 'disabled' : ''}>
        <span class="cell-label">${estado}<small>${fimDeSemana ? 'Fim de semana' : reservado ? `${reservado.turma_atividade} · ${reservado.usuario_nome}` : bloqueado ? 'Indisponivel' : ''}</small></span>
      </button>`;
    });
  });

  grid.innerHTML = html;
  document
    .querySelectorAll('.calendar-cell:not(:disabled)')
    .forEach((celula) => {
      celula.addEventListener('click', () => selecionarHorario(celula));
    });
}

function selecionarHorario(celula) {
  const data = celula.dataset.data;
  if (dataSelecionada && dataSelecionada !== data) periodosSelecionados.clear();
  dataSelecionada = data;

  const chave = `${data}|${celula.dataset.horario}`;
  if (periodosSelecionados.has(chave)) periodosSelecionados.delete(chave);
  else periodosSelecionados.add(chave);
  atualizarSelecao();
  renderizarAgenda();
}

function atualizarSelecao() {
  const painel = document.querySelector('#data-selecionada');
  const periodos = document.querySelector('#periodos-selecionados');
  const confirmar = document.querySelector('.confirmar');
  const ids = [...periodosSelecionados].map((chave) =>
    Number(chave.split('|')[1]),
  );

  if (!dataSelecionada) {
    painel.textContent = 'Selecione um horario';
  } else {
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    painel.textContent = new Date(ano, mes - 1, dia).toLocaleDateString(
      'pt-BR',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      },
    );
  }

  if (!ids.length) {
    periodos.innerHTML = '<span>Nenhum periodo</span>';
  } else {
    periodos.innerHTML = ids
      .map((id) => {
        const horario = horarios.find((item) => Number(item.id) === id);
        return `<span class="chip">Periodo ${horario?.numero_periodo}</span>`;
      })
      .join('');
  }
  confirmar.disabled = !dataSelecionada || !ids.length;
}

async function cancelar(id) {
  try {
    await API.requisicao(`/api/reservas/${id}`, { method: 'DELETE' });
    await carregarDados();
  } catch (erro) {
    document.querySelector('#mensagem').textContent = erro.message;
  }
}

function renderizarReservas() {
  const hoje = isoLocal(new Date());
  const proximas = reservas
    .filter(
      (item) =>
        item.status === 'ATIVA' && dataDaReserva(item.data_reserva) >= hoje,
    )
    .sort(
      (a, b) =>
        dataDaReserva(a.data_reserva).localeCompare(
          dataDaReserva(b.data_reserva),
        ) || Number(a.numero_periodo) - Number(b.numero_periodo),
    )
    .slice(0, 8);

  document.querySelector('#lista-reservas').innerHTML =
    proximas
      .map(
        (item) => `
    <div class="item">
      <div><strong>${item.turma_atividade}</strong>
        ${dataDaReserva(item.data_reserva).split('-').reverse().join('/')} - P${item.numero_periodo}<br>
        Reservado por ${item.usuario_nome}</div>
      ${item.usuario_id === usuario.id || usuario.perfil === 'ADMIN'
        ? `<button type="button" data-cancelar="${item.id}" title="Cancelar reserva">Cancelar</button>`
        : ''}
    </div>`,
      )
      .join('') || '<p>Nenhuma reserva futura.</p>';

  document.querySelectorAll('[data-cancelar]').forEach((botao) => {
    botao.addEventListener('click', () => cancelar(botao.dataset.cancelar));
  });
}

document.querySelector('#semana-anterior').addEventListener('click', () => {
  semanaInicial.setDate(semanaInicial.getDate() - 7);
  renderizarAgenda();
});
document.querySelector('#proxima-semana').addEventListener('click', () => {
  semanaInicial.setDate(semanaInicial.getDate() + 7);
  renderizarAgenda();
});
document.querySelector('#hoje').addEventListener('click', () => {
  semanaInicial = inicioDaSemana(new Date());
  renderizarAgenda();
});
document.querySelector('#limpar-selecao').addEventListener('click', () => {
  dataSelecionada = null;
  periodosSelecionados.clear();
  atualizarSelecao();
  renderizarAgenda();
});
document.querySelector('#botao-nova').addEventListener('click', () => {
  document.querySelector('input[name="turma_atividade"]').focus();
});

document
  .querySelector('#form-reserva')
  .addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const turma = new FormData(formulario).get('turma_atividade').trim();
    const ids = [...periodosSelecionados].map((chave) =>
      Number(chave.split('|')[1]),
    );
    const mensagem = document.querySelector('#mensagem');
    if (!turma || !dataSelecionada || !ids.length) return;

    try {
      await API.requisicao('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          data_reserva: dataSelecionada,
          turma_atividade: turma,
          horarios: ids,
        }),
      });
      mensagem.style.color = '#166534';
      mensagem.textContent = 'Reserva criada com sucesso.';
      formulario.reset();
      dataSelecionada = null;
      periodosSelecionados.clear();
      atualizarSelecao();
      await carregarDados();
    } catch (erro) {
      mensagem.style.color = '#b42318';
      mensagem.textContent = erro.message;
    }
  });

carregarDados().catch((erro) => {
  document.querySelector('#mensagem').textContent = erro.message;
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    carregarDados().catch((erro) => {
      document.querySelector("#mensagem").textContent = erro.message;
    });
  }
});
