API.exigirLogin();
const usuario = API.usuario();
if (usuario?.perfil !== 'ADMIN')
  location.href = `${API.baseURL}/pages/reservas.html`;
document.querySelector('#logout').addEventListener('click', () => API.sair());
const mensagem = document.querySelector('#mensagem');

async function carregar() {
  const bloqueios = await API.requisicao('/api/bloqueios');
  document.querySelector('#lista-bloqueios').innerHTML =
    bloqueios
      .map(
        (item) => `
    <div class="item"><div><strong>${item.data}</strong><br>${item.motivo}</div>
    <button type="button" data-remover="${item.id}">Excluir</button></div>`,
      )
      .join('') || '<p>Nenhum bloqueio encontrado.</p>';
  document.querySelectorAll('[data-remover]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      await API.requisicao(`/api/bloqueios/${botao.dataset.remover}`, {
        method: 'DELETE',
      });
      carregar();
    });
  });
}

document
  .querySelector('#form-bloqueio')
  .addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = Object.fromEntries(new FormData(formulario));
    try {
      await API.requisicao('/api/bloqueios', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      mensagem.style.color = '#166534';
      mensagem.textContent = 'Bloqueio criado.';
      formulario.reset();
      carregar();
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  });

carregar().catch((erro) => (mensagem.textContent = erro.message));
