
Site de receitas da família, com as receitas caseiras da mãe da Fabrine e uma área para explorar novas receitas de uma API pública.

Projeto Final (RA 3) de Web Dev Front-End, PUCPR, 2026.

**Site publicado:** _colar aqui o link do GitHub Pages_

## Integrantes

| Integrante | O que fez |
| --- | --- |
| Eric Binek Sant'Anna | API e JavaScript: requisições GET/POST, cartões dinâmicos, busca, filtro, favoritos, modo escuro e a ferramenta do TDE 01 |
| _Nome_ | _Contribuição_ |
| _Nome_ | _Contribuição_ |
| _Nome_ | _Contribuição_ |

## Páginas

| Página | Arquivo | Conteúdo |
| --- | --- | --- |
| Início | `index.html` | Apresentação do tema e as receitas da família |
| Explorar | `explorar.html` | Receitas da API em cartões, com busca, filtro por categoria e favoritos |
| Ferramentas | `ferramentas.html` | Ajuste de porções, calculadora e estatísticas dos favoritos (TDE 01) |
| Contato | `contato.html` | Formulário enviado com POST |

## Estrutura do JavaScript

| Arquivo | Responsabilidade |
| --- | --- |
| `js/script.js` | Código comum a todas as páginas: constantes, `requisitarJson`, acesso ao `localStorage` (`armazenamento`), favoritos (`repositorioFavoritos`) e modo escuro (`controladorTema`) |
| `js/explorar.js` | Busca na API (`servicoReceitas`), estado da página, criação dos cartões, busca, filtro e favoritos |
| `js/ferramentas.js` | Funções do TDE 01 e eventos da página Ferramentas |
| `js/contato.js` | Validação dos campos e envio do formulário (`servicoContato`) |

O código separa as responsabilidades em camadas:

- **Serviços** (`servicoReceitas`, `servicoContato`): são os únicos que conhecem as URLs e o formato da API.
- **Adaptador** (`servicoReceitas.converter`): transforma o objeto da API (`strMeal`, `strIngredient1`...) num objeto próprio (`nome`, `ingredientes`...), assim o resto do código não depende dos nomes da API.
- **Repositório** (`armazenamento`, `repositorioFavoritos`): concentra todo o acesso ao `localStorage`, sempre com `JSON.stringify` e `JSON.parse`.
- **Estado + renderização** (`estadoExplorar`, `mostrarCartoes`): a tela é sempre redesenhada a partir do estado, nunca editada aos pedaços.
- **Fábrica** (`criarCartao`): monta cada cartão com `createElement`, `textContent` e `appendChild`.

## API

**TheMealDB:** pública, gratuita, sem chave e com CORS liberado.

| Uso | Método | Endpoint |
| --- | --- | --- |
| Lista inicial e busca por nome | GET | `https://www.themealdb.com/api/json/v1/1/search.php?s={termo}` |
| Formulário de contato | POST | `https://jsonplaceholder.typicode.com/posts` |

- Com a busca vazia, o site pesquisa por `cake`, porque `search.php?s=` sem termo devolve `"no data found"` em vez de uma lista.
- A busca roda no evento `input`, com 400 ms de espera depois da última tecla (para não fazer um GET por letra). Se uma resposta antiga chegar depois de uma nova, ela é ignorada.
- O filtro por categoria (evento `change`) filtra o array já carregado, sem nova requisição.

### localStorage

| Chave | Conteúdo |
| --- | --- |
| `receitas:favoritos` | Array com as receitas favoritas (`id`, `nome`, `categoria`, `origem`, `imagem`, `ingredientes`) |
| `receitas:modoEscuro` | `true` ou `false` |

## TDE 01 · Funções

Arquivo: `js/ferramentas.js` (exceto onde indicado).

| Função | Tipo | Recebe | Devolve | Onde é usada |
| --- | --- | --- | --- | --- |
| `somar(a, b)` | nomeada | dois números | `a + b` | Calculadora da cozinha e `reduce` de `calcularMedia` |
| `subtrair(a, b)` | nomeada | dois números | `a - b` | Calculadora da cozinha |
| `multiplicar(a, b)` | nomeada | dois números | `a * b` | Calculadora da cozinha e `ajustarQuantidade` |
| `dividir(a, b)` | nomeada | dois números | `a / b`, ou `null` se `b` for 0 | Calculadora, `ajustarQuantidade` e `calcularMedia`. O `null` faz a tela mostrar "Não é possível dividir por zero." em vez de `Infinity` |
| `calcular(a, b, operacao)` | **callback** | dois números e uma função | o resultado de `operacao(a, b)` | Ex.: `calcular(desejadas, originais, dividir)`. É usada em todos os cálculos da página |
| `ajustarQuantidade(quantidade, porcoesOriginais, porcoesDesejadas)` | nomeada | três números | a quantidade para o novo número de porções, ou `null` | Ferramenta "Ajustar ingredientes para N porções" |
| `calcularMedia(numeros)` | **arrow** | array de números | a média (usa `reduce` com `somar`) | Estatísticas dos favoritos |
| `filtrarPorMaximoDeIngredientes(receitas, limite)` | **arrow** | array de receitas e um número | as receitas com até `limite` ingredientes (`filter`) | Estatísticas dos favoritos |
| `formatarNumero(numero)` | **arrow** | número | texto no formato brasileiro (`1.234,5`) | Todos os resultados |
| `lerNumero(campo)` | nomeada | um `<input>` | o número digitado, ou `null` se estiver vazio | Leitura dos campos |
| `calcularPorcoes()` | nomeada | nada | nada (escreve na tela) | Botão "Ajustar" |
| `calcularOperacao()` | nomeada | nada | nada (escreve na tela) | Botão "Calcular" |
| `mostrarEstatisticas()` | nomeada | nada | nada (escreve na tela) | Ao abrir a página e no evento `input` do limite |
| `function () { ... }` | **anônima** | nada | nada | `addEventListener("click", ...)` dos botões "Ajustar" e "Calcular" |

Exemplo da callback:

```js
function calcular(a, b, operacao) {
    return operacao(a, b);
}

calcular(10, 2, dividir);
```

## TDE 02 · Debugging

_Preencher com os bugs reais encontrados pelo grupo (mínimo 3, pelo menos 1 de lógica, 1 print de breakpoint com Scope/Watch e 1 investigado pela aba Network)._

### Bug 1 · _título_

- **Tipo:** sintaxe / execução / lógica
- **Sintoma ou mensagem do console:**
- **Como foi identificado:** console.log / breakpoint / Watch / Scope / aba Network
- **Solução:**

Antes:

```js
```

Depois:

```js
```

![Print do breakpoint](img/debug/bug1.png)

### Bug 2 · _título_

- **Tipo:**
- **Sintoma ou mensagem do console:**
- **Como foi identificado:**
- **Solução:**

Antes:

```js
```

Depois:

```js
```

### Bug 3 · _título_

- **Tipo:**
- **Sintoma ou mensagem do console:**
- **Como foi identificado:**
- **Solução:**

Antes:

```js
```

Depois:

```js
```
