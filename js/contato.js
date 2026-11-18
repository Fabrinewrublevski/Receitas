// Endereço do POST (o JSONPlaceholder finge que salva e devolve 201).
const POST_URL = "https://jsonplaceholder.typicode.com/posts";

// Serviço do formulário: envia os dados em JSON com POST.
const servicoContato = {
    async enviar(dados) {
        return requisitarJson(POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    }
};

// Marca o campo com a classe "erro" se for inválido.
function validarCampo(campo) {
    campo.classList.toggle("erro", !campo.checkValidity());
}

// Mostra o status do envio ou a mensagem de erro.
function mostrarRetorno(texto, ehErro = false) {
    const retorno = document.getElementById("retornoEnvio");
    retorno.textContent = texto;
    retorno.classList.toggle("erro", ehErro);
}

// Evento submit: impede o envio padrão, faz o POST, mostra o status e limpa o formulário.
async function enviarFormulario(evento) {
    evento.preventDefault();

    const formulario = evento.target;
    const botaoEnviar = formulario.querySelector('button[type="submit"]');
    const dados = Object.fromEntries(new FormData(formulario));

    botaoEnviar.disabled = true;
    mostrarRetorno("Enviando...");

    try {
        const { status, dados: resposta } = await servicoContato.enviar(dados);
        mostrarRetorno(`Status ${status}: mensagem enviada com sucesso! Protocolo nº ${resposta.id}.`);
        formulario.reset();
        formulario.querySelectorAll(".erro").forEach((campo) => campo.classList.remove("erro"));
    } catch (erro) {
        mostrarRetorno("Não foi possível enviar sua mensagem. Tente novamente.", true);
    } finally {
        botaoEnviar.disabled = false;
    }
}

// Liga os eventos blur, input e submit do formulário.
function iniciarContato() {
    const formulario = document.getElementById("formContato");

    formulario.querySelectorAll("input, textarea").forEach((campo) => {
        campo.addEventListener("blur", () => validarCampo(campo));
        campo.addEventListener("input", () => campo.classList.remove("erro"));
    });

    formulario.addEventListener("submit", enviarFormulario);
}

document.addEventListener("DOMContentLoaded", iniciarContato);
