// Constantes de valor fixo: endereço da API e chaves usadas no localStorage.
const API_URL = "https://www.themealdb.com/api/json/v1/1";
const CHAVE_FAVORITOS = "receitas:favoritos";
const CHAVE_TEMA = "receitas:modoEscuro";
const CLASSE_ESCURO = "escuro";

// Faz a requisição, confere se a resposta está ok (antes do .json()) e devolve status + dados.
async function requisitarJson(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        throw new Error(`A requisição falhou com status ${resposta.status}.`);
    }

    const dados = await resposta.json();
    return { status: resposta.status, dados: dados };
}

// Único lugar que fala com o localStorage: sempre converte com JSON.stringify / JSON.parse.
const armazenamento = {
    ler(chave, valorPadrao) {
        try {
            const texto = localStorage.getItem(chave);

            if (texto === null) {
                return valorPadrao;
            }

            return JSON.parse(texto);
        } catch (erro) {
            return valorPadrao;
        }
    },

    salvar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
        } catch (erro) {
            // Sem armazenamento disponível (ex.: aba anônima): o site segue funcionando sem salvar.
        }
    }
};

// Favoritos: listar, verificar se um item já é favorito e marcar/desmarcar.
const repositorioFavoritos = {
    listar() {
        return armazenamento.ler(CHAVE_FAVORITOS, []);
    },

    contem(id) {
        return repositorioFavoritos.listar().map((receita) => receita.id).includes(id);
    },

    alternar(receita) {
        const favoritos = repositorioFavoritos.listar();
        const indice = favoritos.findIndex((favorito) => favorito.id === receita.id);

        if (indice === -1) {
            favoritos.push(receita);
        } else {
            favoritos.splice(indice, 1);
        }

        armazenamento.salvar(CHAVE_FAVORITOS, favoritos);
        return indice === -1;
    }
};

// Modo escuro: liga/desliga a classe "escuro" no body e guarda a preferência.
const controladorTema = {
    aplicar(modoEscuro) {
        document.body.classList.toggle(CLASSE_ESCURO, modoEscuro);

        const botaoTema = document.getElementById("botaoTema");

        if (botaoTema) {
            botaoTema.setAttribute("aria-pressed", String(modoEscuro));
        }
    },

    alternar() {
        const modoEscuro = !document.body.classList.contains(CLASSE_ESCURO);
        controladorTema.aplicar(modoEscuro);
        armazenamento.salvar(CHAVE_TEMA, modoEscuro);
    },

    iniciar() {
        controladorTema.aplicar(armazenamento.ler(CHAVE_TEMA, false));

        const botaoTema = document.getElementById("botaoTema");

        if (botaoTema) {
            botaoTema.addEventListener("click", controladorTema.alternar);
        }
    }
};

// Ao carregar a página, aplica o tema salvo e liga o botão da lua.
document.addEventListener("DOMContentLoaded", controladorTema.iniciar);
