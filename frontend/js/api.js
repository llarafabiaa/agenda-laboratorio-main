const API = {
  baseURL: 'http://localhost:3000',
  token: localStorage.getItem('token'),
  async requisicao(url, opcoes = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(opcoes.headers || {}),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const endereco = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const resposta = await fetch(endereco, {
      cache: "no-store",
      ...opcoes,
      headers
    });
    if (resposta.status === 204) return null;
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || 'Erro na requisicao');
    return dados;
  },
  usuario() {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  },
  exigirLogin() {
    if (!this.token) location.href = `${this.baseURL}/`;
  },
  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    location.href = `${this.baseURL}/`;
  },
};
