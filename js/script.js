const API_URL = "https://www.themealdb.com/api/json/v1/1";
const CHAVE_FAVORITOS = "receitas:favoritos";
const CHAVE_TEMA = "receitas:modoEscuro";
const CLASSE_ESCURO = "escuro";

async function requisitarJson(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        throw new Error(`A requisição falhou com status ${resposta.status}.`);
    }

    const dados = await resposta.json();
    return { status: resposta.status, dados: dados };
}

const armazenamento = {
    ler(chave, valorPadrao) {
        const texto = localStorage.getItem(chave);

        if (texto === null) {
            return valorPadrao;
        }

        try {
            return JSON.parse(texto);
        } catch (erro) {
            return valorPadrao;
        }
    },

    salvar(chave, valor) {
        localStorage.setItem(chave, JSON.stringify(valor));
    }
};

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

document.addEventListener("DOMContentLoaded", controladorTema.iniciar);
