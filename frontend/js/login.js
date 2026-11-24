document
  .querySelector('#form-login')
  .addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    const mensagem = document.querySelector('#mensagem');
    try {
      const resposta = await API.requisicao('/api/usuarios/login', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      location.href = `${API.baseURL}/pages/reservas.html`;
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  });
