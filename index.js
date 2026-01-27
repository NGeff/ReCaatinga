const fs = require("fs");
const path = require("path");

// nomes a serem ignorados
const IGNORADOS = [
  ".git",
  "node_modules",
  ".vscode",
  ".idea",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
];

function mostrarEstrutura(dir, prefixo = "") {
  let itens;

  try {
    itens = fs.readdirSync(dir);
  } catch {
    return; // sem permissão
  }

  itens = itens.filter(item => !IGNORADOS.includes(item));

  itens.forEach((item, index) => {
    const caminhoCompleto = path.join(dir, item);
    let stats;

    try {
      stats = fs.statSync(caminhoCompleto);
    } catch {
      return;
    }

    const ultimo = index === itens.length - 1;
    const conector = ultimo ? "└── " : "├── ";

    console.log(prefixo + conector + item);

    if (stats.isDirectory()) {
      const novoPrefixo = prefixo + (ultimo ? "    " : "│   ");
      mostrarEstrutura(caminhoCompleto, novoPrefixo);
    }
  });
}

// diretório atual
mostrarEstrutura(process.cwd());