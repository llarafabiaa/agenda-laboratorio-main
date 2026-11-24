document
  .querySelector('#form-cadastro')
  .addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    const mensagem = document.querySelector('#mensagem');
    try {
      await API.requisicao('/api/usuarios/cadastro', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      mensagem.style.color = '#166534';
      mensagem.textContent = 'Conta criada. Faca login.';
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  });
