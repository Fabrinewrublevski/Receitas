// Constantes da página: limite de ingredientes da API, tempo de espera da busca e termo inicial.
const TOTAL_INGREDIENTES_API = 20;
const ATRASO_BUSCA_MS = 400;
const TODAS_CATEGORIAS = "todas";
const TERMO_PADRAO = "cake";

// Serviço da API: converte o objeto da TheMealDB para o formato do site e busca por nome.
const servicoReceitas = {
    converter(receitaApi) {
        const ingredientes = [];

        for (let posicao = 1; posicao <= TOTAL_INGREDIENTES_API; posicao++) {
            const ingrediente = receitaApi[`strIngredient${posicao}`];
            const medida = receitaApi[`strMeasure${posicao}`];

            if (ingrediente && ingrediente.trim() !== "") {
                ingredientes.push(`${medida ? medida.trim() : ""} ${ingrediente.trim()}`.trim());
            }
        }

        return {
            id: receitaApi.idMeal,
            nome: receitaApi.strMeal,
            categoria: receitaApi.strCategory,
            origem: receitaApi.strArea,
            imagem: receitaApi.strMealThumb,
            ingredientes: ingredientes
        };
    },

    async buscarPorNome(termo) {
        const url = `${API_URL}/search.php?s=${encodeURIComponent(termo)}`;
        const { dados } = await requisitarJson(url);
        const receitasApi = Array.isArray(dados.meals) ? dados.meals : [];

        return receitasApi.map(servicoReceitas.converter);
    }
};

// Estado da página: array de receitas carregadas, categoria escolhida e controle da busca.
const estadoExplorar = {
    receitas: [],
    categoria: TODAS_CATEGORIAS,
    ultimaBusca: 0,
    temporizadorBusca: null
};

// Guarda os elementos da página (preenchido em iniciarExplorar).
const elementosExplorar = {};

// Mostra mensagens como "Carregando..." ou erros para o usuário.
function mostrarStatus(texto, ehErro = false) {
    elementosExplorar.status.textContent = texto;
    elementosExplorar.status.classList.toggle("erro", ehErro);
    elementosExplorar.status.hidden = texto === "";
}

// Atualiza texto, classe e aria-pressed do botão de favorito.
function atualizarBotaoFavorito(botao, favorito) {
    botao.classList.toggle("favorito", favorito);
    botao.textContent = favorito ? "★ Favorito" : "☆ Favoritar";
    botao.setAttribute("aria-pressed", String(favorito));
}

// Monta um cartão com createElement, textContent e appendChild (sem innerHTML).
function criarCartao(receita) {
    const cartao = document.createElement("article");
    cartao.classList.add("cenoura", "cartao");

    const imagem = document.createElement("img");
    imagem.src = receita.imagem;
    imagem.alt = `Foto do prato ${receita.nome}`;
    imagem.loading = "lazy";

    const conteudo = document.createElement("div");

    const titulo = document.createElement("h2");
    titulo.textContent = receita.nome;

    const detalhes = document.createElement("p");
    detalhes.textContent = `${receita.categoria} · ${receita.origem}`;

    const necessario = document.createElement("h3");
    necessario.textContent = "Necessário:";

    const quantidade = document.createElement("p");
    quantidade.textContent = `${receita.ingredientes.length} ingredientes`;

    const botaoFavorito = document.createElement("button");
    botaoFavorito.type = "button";
    botaoFavorito.classList.add("botao", "botaoFavorito");
    atualizarBotaoFavorito(botaoFavorito, repositorioFavoritos.contem(receita.id));

    botaoFavorito.addEventListener("click", () => {
        const agoraFavorito = repositorioFavoritos.alternar(receita);
        atualizarBotaoFavorito(botaoFavorito, agoraFavorito);
    });

    conteudo.appendChild(titulo);
    conteudo.appendChild(detalhes);
    conteudo.appendChild(necessario);
    conteudo.appendChild(quantidade);
    conteudo.appendChild(botaoFavorito);

    cartao.appendChild(imagem);
    cartao.appendChild(conteudo);

    return cartao;
}

// Filtra o array de receitas pela categoria escolhida (sem nova requisição).
function filtrarPorCategoria(receitas, categoria) {
    if (categoria === TODAS_CATEGORIAS) {
        return receitas;
    }

    return receitas.filter((receita) => receita.categoria === categoria);
}

// Redesenha a lista de cartões a partir do estado.
function mostrarCartoes() {
    const visiveis = filtrarPorCategoria(estadoExplorar.receitas, estadoExplorar.categoria);

    elementosExplorar.lista.replaceChildren();

    if (visiveis.length === 0) {
        mostrarStatus("Nenhuma receita encontrada.");
        return;
    }

    mostrarStatus("");
    visiveis.forEach((receita) => {
        elementosExplorar.lista.appendChild(criarCartao(receita));
    });
}

// Cria uma <option> para o filtro de categorias.
function criarOpcao(valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    return opcao;
}

// Monta o filtro com as categorias que existem nas receitas carregadas.
function atualizarCategorias() {
    const categorias = estadoExplorar.receitas
        .map((receita) => receita.categoria)
        .filter((categoria, indice, lista) => lista.indexOf(categoria) === indice)
        .sort();

    if (!categorias.includes(estadoExplorar.categoria)) {
        estadoExplorar.categoria = TODAS_CATEGORIAS;
    }

    elementosExplorar.filtro.replaceChildren(criarOpcao(TODAS_CATEGORIAS, "Todas as categorias"));
    categorias.forEach((categoria) => {
        elementosExplorar.filtro.appendChild(criarOpcao(categoria, categoria));
    });
    elementosExplorar.filtro.value = estadoExplorar.categoria;
}

// Busca na API; ignora respostas antigas que chegarem depois de uma busca mais nova.
async function carregarReceitas(termo) {
    const numeroBusca = ++estadoExplorar.ultimaBusca;

    elementosExplorar.lista.replaceChildren();
    mostrarStatus("Carregando...");

    try {
        const receitas = await servicoReceitas.buscarPorNome(termo || TERMO_PADRAO);

        if (numeroBusca !== estadoExplorar.ultimaBusca) {
            return;
        }

        estadoExplorar.receitas = receitas;
        atualizarCategorias();
        mostrarCartoes();
    } catch (erro) {
        if (numeroBusca !== estadoExplorar.ultimaBusca) {
            return;
        }

        estadoExplorar.receitas = [];
        mostrarStatus("Não foi possível carregar as receitas. Verifique sua conexão e tente novamente.", true);
    }
}

// Evento input: espera o usuário parar de digitar antes de buscar.
function agendarBusca(evento) {
    const termo = evento.target.value.trim();

    clearTimeout(estadoExplorar.temporizadorBusca);
    estadoExplorar.temporizadorBusca = setTimeout(() => carregarReceitas(termo), ATRASO_BUSCA_MS);
}

// Liga os eventos da página (input da busca, change do filtro) e faz a primeira busca.
function iniciarExplorar() {
    elementosExplorar.lista = document.getElementById("listaReceitas");
    elementosExplorar.status = document.getElementById("statusReceitas");
    elementosExplorar.busca = document.getElementById("campoBusca");
    elementosExplorar.filtro = document.getElementById("filtroCategoria");

    elementosExplorar.busca.addEventListener("input", agendarBusca);

    elementosExplorar.filtro.addEventListener("change", (evento) => {
        estadoExplorar.categoria = evento.target.value;
        mostrarCartoes();
    });

    carregarReceitas("");
}

document.addEventListener("DOMContentLoaded", iniciarExplorar);
