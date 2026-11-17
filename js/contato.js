const POST_URL = "https://jsonplaceholder.typicode.com/posts";

const servicoContato = {
    async enviar(dados) {
        return requisitarJson(POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    }
};

function validarCampo(campo) {
    campo.classList.toggle("erro", !campo.checkValidity());
}

function mostrarRetorno(texto, ehErro = false) {
    const retorno = document.getElementById("retornoEnvio");
    retorno.textContent = texto;
    retorno.classList.toggle("erro", ehErro);
}

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

function iniciarContato() {
    const formulario = document.getElementById("formContato");

    formulario.querySelectorAll("input, textarea").forEach((campo) => {
        campo.addEventListener("blur", () => validarCampo(campo));
        campo.addEventListener("input", () => campo.classList.remove("erro"));
    });

    formulario.addEventListener("submit", enviarFormulario);
}

document.addEventListener("DOMContentLoaded", iniciarContato);
