//Set do labirinto
const labirinto = [
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0]
];


//
const containerLabirinto = document.getElementById('maze');
const celulas = [];
let noInicio = null;
let noObjetivo = null;

for (let i = 0; i < labirinto.length; i++) {
    for (let j = 0; j < labirinto[i].length; j++) {
        const celula = document.createElement('div');
        celula.className = 'cell';
        const index = i * labirinto[0].length + j;
        celula.textContent = index; 
        if (labirinto[i][j] === 1) {
            celula.classList.add('blocked');
        } else {
            celula.onclick = () => selecionarNo(i, j);
        }
        containerLabirinto.appendChild(celula);
        celulas.push(celula);
    }
}


function selecionarNo(i, j) {
    const index = i * labirinto[0].length + j;
    if (labirinto[i][j] === 1) {
        alert('Este é um obstáculo! Selecione outro.');
        return;
    }
    if (noInicio === null) {
        noInicio = index;
        celulas[index].classList.add('start');
    } else if (noObjetivo === null && index !== noInicio) {
        noObjetivo = index;
        celulas[index].classList.add('goal');
    } else {
        limparSelecao();
        noInicio = index;
        noObjetivo = null;
        celulas[index].classList.add('start');
    }
}

function limparSelecao() {
    celulas.forEach(celula => {
        celula.classList.remove('start', 'goal');
    });
}

document.getElementById('searchMethod').addEventListener('change', function() {
    const metodo = this.value;
    const limiteInput = document.getElementById('dlsLimit');
    
    if (metodo === 'dls') {
        limiteInput.style.display = 'inline-block';
    } else {
        limiteInput.style.display = 'none';
    }
});

function iniciarBusca() {
    if (noInicio === null || noObjetivo === null) {
        alert('Selecione os estados inicial e objetivo.');
        return;
    }

    const metodo = document.getElementById('searchMethod').value;
    limparVisitados();
    limparCaminho();
    
    switch (metodo) {
        case 'bfs':
            bfs();
            break;
        case 'dfs':
            dfs();
            break;
        case 'dls':
            const limite = parseInt(document.getElementById('dlsLimit').value, 10);
            if (isNaN(limite) || limite < 0) {
                alert('Por favor, insira um limite de profundidade válido.');
                return;
            }
            dls(limite);
            break;
        case 'ids':
            ids();
            break;
        case 'bidirectional':
            bidirecional();
            break;
    }
}

function bfs() {
    const fila = [noInicio];
    const visitados = new Set();
    const pai = {};
    while (fila.length > 0) {
        const no = fila.shift();
        if (no === noObjetivo) {
            exibirCaminho(pai, no);
            return;
        }
        if (!visitados.has(no)) {
            visitados.add(no);
            celulas[no].classList.add('visited');
            obterVizinhos(no).forEach(vizinho => {
                if (!visitados.has(vizinho)) {
                    fila.push(vizinho);
                    pai[vizinho] = no;
                }
            });
        }
    }
}

function dfs() {
    const pilha = [noInicio];
    const visitados = new Set();
    const pai = {};
    while (pilha.length > 0) {
        const no = pilha.pop();
        if (no === noObjetivo) {
            exibirCaminho(pai, no);
            return;
        }
        if (!visitados.has(no)) {
            visitados.add(no);
            celulas[no].classList.add('visited');
            obterVizinhos(no).forEach(vizinho => {
                if (!visitados.has(vizinho)) {
                    pilha.push(vizinho);
                    pai[vizinho] = no;
                }
            });
        }
    }
}

function dls(limite) {
    const visitados = new Set();
    const pai = {};
    if (dlsRecursiva(noInicio, limite, visitados, pai)) {
        exibirCaminho(pai, noObjetivo);
    }
}

function dlsRecursiva(no, limite, visitados, pai) {
    if (no === noObjetivo) return true;
    if (limite <= 0) return false;
    visitados.add(no);
    celulas[no].classList.add('visited');
    for (const vizinho of obterVizinhos(no)) {
        if (!visitados.has(vizinho)) {
            pai[vizinho] = no;
            if (dlsRecursiva(vizinho, limite - 1, visitados, pai)) {
                return true;
            }
        }
    }
    return false;
}

function ids() {
    let profundidade = 0;
    const pai = {};
    while (!dlsRecursiva(noInicio, profundidade, new Set(), pai)) {
        profundidade++;
    }
    exibirCaminho(pai, noObjetivo);
}

function bidirecional() {
    const filaInicio = [noInicio];
    const filaFim = [noObjetivo];
    const visitadosInicio = new Set();
    const visitadosFim = new Set();
    const paiInicio = {};
    const paiFim = {};
    while (filaInicio.length > 0 && filaFim.length > 0) {
        if (passoBidirecional(filaInicio, visitadosInicio, visitadosFim, paiInicio, paiFim)) {
            return;
        }
        if (passoBidirecional(filaFim, visitadosFim, visitadosInicio, paiFim, paiInicio)) {
            return;
        }
    }
}

function passoBidirecional(fila, visitados, visitadosOutroLado, pai, paiOutroLado) {
    const no = fila.shift();
    if (visitadosOutroLado.has(no)) {
        exibirCaminho(pai, no, paiOutroLado);
        return true;
    }
    if (!visitados.has(no)) {
        visitados.add(no);
        celulas[no].classList.add('visited');
        obterVizinhos(no).forEach(vizinho => {
            if (!visitados.has(vizinho)) {
                fila.push(vizinho);
                pai[vizinho] = no;
            }
        });
    }
    return false;
}

function obterVizinhos(no) {
    const vizinhos = [];
    const linha = Math.floor(no / labirinto[0].length);
    const coluna = no % labirinto[0].length;

    if (linha > 0 && labirinto[linha - 1][coluna] === 0) vizinhos.push(no - labirinto[0].length); // Cima
    if (linha < labirinto.length - 1 && labirinto[linha + 1][coluna] === 0) vizinhos.push(no + labirinto[0].length); // Baixo
    if (coluna > 0 && labirinto[linha][coluna - 1] === 0) vizinhos.push(no - 1); // Esquerda
    if (coluna < labirinto[0].length - 1 && labirinto[linha][coluna + 1] === 0) vizinhos.push(no + 1); // Direita

    return vizinhos;
}

function exibirCaminho(pai, no, paiOutroLado = null) {
let caminho = [no];
while (no in pai) {
    no = pai[no];
    caminho.push(no);
}
if (paiOutroLado) {
    no = caminho[0];
    while (no in paiOutroLado) {
        no = paiOutroLado[no];
        caminho.unshift(no);
    }
}
caminho.reverse();
caminho.forEach(no => celulas[no].classList.add('path'));

// Calcular o custo como o número de passos (nós no caminho)
const custo = caminho.length - 1; // Subtrai 1 porque o caminho inclui o nó inicial
document.getElementById('output').textContent = `Caminho encontrado com custo de ${custo} passos.`;
}

function limparVisitados() {
    celulas.forEach(celula => {
        celula.classList.remove('visited');
    });
}

function limparCaminho() {
    celulas.forEach(celula => {
        celula.classList.remove('path');
    });
}