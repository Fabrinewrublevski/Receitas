// Mensagens mostradas ao usuário.
const MENSAGEM_DIVISAO_POR_ZERO = "Não é possível dividir por zero.";
const MENSAGEM_CAMPOS_VAZIOS = "Preencha todos os campos com números.";

// As 4 operações básicas. A divisão devolve null quando o divisor é 0.
function somar(a, b) {
    return a + b;
}

function subtrair(a, b) {
    return a - b;
}

function multiplicar(a, b) {
    return a * b;
}

function dividir(a, b) {
    if (b === 0) {
        return null;
    }

    return a / b;
}

// Callback: recebe a operação (outra função) como parâmetro.
function calcular(a, b, operacao) {
    return operacao(a, b);
}

// Liga o valor do <select> à função correspondente.
const OPERACOES = {
    somar: somar,
    subtrair: subtrair,
    multiplicar: multiplicar,
    dividir: dividir
};

// Ajusta a quantidade de um ingrediente para outro número de porções.
function ajustarQuantidade(quantidade, porcoesOriginais, porcoesDesejadas) {
    const fator = calcular(porcoesDesejadas, porcoesOriginais, dividir);

    if (fator === null) {
        return null;
    }

    return calcular(quantidade, fator, multiplicar);
}

// Arrow function: média de um array de números (usa reduce).
const calcularMedia = (numeros) => {
    if (numeros.length === 0) {
        return 0;
    }

    return calcular(numeros.reduce(somar, 0), numeros.length, dividir);
};

// Arrow function: filtra receitas com até N ingredientes.
const filtrarPorMaximoDeIngredientes = (receitas, limite) =>
    receitas.filter((receita) => receita.ingredientes.length <= limite);

// Arrow function: formata o número no padrão brasileiro.
const formatarNumero = (numero) => numero.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

// Lê o número de um campo; devolve null se estiver vazio ou inválido.
function lerNumero(campo) {
    if (campo.value.trim() === "") {
        return null;
    }

    const numero = Number(campo.value);
    return Number.isNaN(numero) ? null : numero;
}

// Escreve o resultado na tela (e marca como erro, se for o caso).
function mostrarResultado(elemento, texto, ehErro = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("erro", ehErro);
}

// Callback: recebe a operação (outra função) como parâmetro.
function calcularPorcoes() {
    const quantidade = lerNumero(document.getElementById("quantidadeOriginal"));
    const porcoesOriginais = lerNumero(document.getElementById("porcoesOriginais"));
    const porcoesDesejadas = lerNumero(document.getElementById("porcoesDesejadas"));
    const resultado = document.getElementById("resultadoPorcoes");

    if ([quantidade, porcoesOriginais, porcoesDesejadas].includes(null)) {
        mostrarResultado(resultado, MENSAGEM_CAMPOS_VAZIOS, true);
        return;
    }

    const quantidadeAjustada = ajustarQuantidade(quantidade, porcoesOriginais, porcoesDesejadas);

    if (quantidadeAjustada === null) {
        mostrarResultado(resultado, MENSAGEM_DIVISAO_POR_ZERO, true);
        return;
    }

    mostrarResultado(resultado, `Para ${formatarNumero(porcoesDesejadas)} porções, use ${formatarNumero(quantidadeAjustada)}.`);
}

// Callback: recebe a operação (outra função) como parâmetro.
function calcularOperacao() {
    const numeroA = lerNumero(document.getElementById("numeroA"));
    const numeroB = lerNumero(document.getElementById("numeroB"));
    const operacao = OPERACOES[document.getElementById("operacao").value];
    const resultado = document.getElementById("resultadoOperacao");

    if (numeroA === null || numeroB === null) {
        mostrarResultado(resultado, MENSAGEM_CAMPOS_VAZIOS, true);
        return;
    }

    const valor = calcular(numeroA, numeroB, operacao);

    if (valor === null) {
        mostrarResultado(resultado, MENSAGEM_DIVISAO_POR_ZERO, true);
        return;
    }

    mostrarResultado(resultado, `Resultado: ${formatarNumero(valor)}`);
}

// Média de ingredientes dos favoritos e lista filtrada pelo limite digitado.
function mostrarEstatisticas() {
    const favoritos = repositorioFavoritos.listar();
    const resumo = document.getElementById("resumoFavoritos");
    const lista = document.getElementById("listaFiltrada");
    const limite = lerNumero(document.getElementById("limiteIngredientes"));

    lista.replaceChildren();

    if (favoritos.length === 0) {
        resumo.textContent = "Você ainda não tem favoritos. Marque algumas receitas na página Explorar.";
        return;
    }

    const quantidades = favoritos.map((receita) => receita.ingredientes.length);
    const media = calcularMedia(quantidades);
    resumo.textContent = `${favoritos.length} receitas favoritas, com média de ${formatarNumero(media)} ingredientes.`;

    if (limite === null) {
        return;
    }

    const filtradas = filtrarPorMaximoDeIngredientes(favoritos, limite);

    if (filtradas.length === 0) {
        const vazio = document.createElement("li");
        vazio.textContent = `Nenhuma favorita com até ${formatarNumero(limite)} ingredientes.`;
        lista.appendChild(vazio);
        return;
    }

    filtradas.forEach((receita) => {
        const item = document.createElement("li");
        item.textContent = `${receita.nome} (${receita.ingredientes.length} ingredientes)`;
        lista.appendChild(item);
    });
}

// Liga os eventos: click (funções anônimas) e input.
function iniciarFerramentas() {
    document.getElementById("botaoPorcoes").addEventListener("click", function () {
        calcularPorcoes();
    });

    document.getElementById("botaoOperacao").addEventListener("click", function () {
        calcularOperacao();
    });

    document.getElementById("limiteIngredientes").addEventListener("input", mostrarEstatisticas);

    mostrarEstatisticas();
}

document.addEventListener("DOMContentLoaded", iniciarFerramentas);
