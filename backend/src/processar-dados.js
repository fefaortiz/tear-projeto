/* ARQUIVO: processar-dados.js (Corrigido com trim()) */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync'); // Importa o leitor de CSV

// --- 1. Definição das Colunas e Faixas Etárias ---

const FAIXAS_ETARIAS = [
  "0–4", "5–9", "10–14", "15–19", "20–24", "25–29",
  "30–34", "35–39", "40–44", "45–49", "50–54", "55–59",
  "60–64", "65–69", "70–74", "75–79", "80–84", "85–89",
  "90–94", "95–99", "100+"
];

const COLUNAS = {
  NOME_ESTADO: 0, 
  TOTAL_ESTADO: 67, 
  HOMENS_INICIO: 90, 
  HOMENS_FIM: 111,   
  MULHERES_INICIO: 112,
  MULHERES_FIM: 133    
};

// --- 2. Função Principal ---

async function processarDados() {
  try {
    console.log('Iniciando processamento dos dados...');

    // --- Leitura dos Arquivos ---
    const jsonBasePath = path.join(__dirname, 'data', 'autism-data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonBasePath, 'utf-8'));

    const csvPath = path.join(__dirname, 'data', 'Distribuição Geral - Autism Data in Brazil - Tabela.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // --- Processamento do CSV ---
    const records = parse(csvContent, {
      delimiter: ',',
      skip_empty_lines: true
    });

    const mapaEstados = new Map(jsonData.por_estado.map(e => [e.uf, e]));
    
    console.log(`Mapa de ${mapaEstados.size} estados criado. Iniciando leitura do CSV...`);
    
    // Pula as linhas de cabeçalho (linhas 0-6 não são dados)
    const linhasDeDados = records.slice(7); 
    let estadosProcessados = 0;
    let linhasIgnoradas = 0;

    for (const row of linhasDeDados) {
      // <-- MUDANÇA: Adiciona .trim() para remover espaços
      const nomeUfCsv = row[COLUNAS.NOME_ESTADO].trim(); 

      if (mapaEstados.has(nomeUfCsv)) {
        const estado = mapaEstados.get(nomeUfCsv);

        // 1. Extrai o Total do Estado
        // <-- MUDANÇA: Adiciona .trim() por segurança
        const totalStr = row[COLUNAS.TOTAL_ESTADO].trim().replace(/[.,]/g, '');
        estado.total_estado = parseInt(totalStr, 10) || 0;

        // 2. Extrai a Pirâmide Local
        estado.piramide_local = [];
        
        for (let i = 0; i <= (COLUNAS.HOMENS_FIM - COLUNAS.HOMENS_INICIO); i++) {
          const faixa = FAIXAS_ETARIAS[i] || "Desconhecida";

          // <-- MUDANÇA: Adiciona .trim() por segurança
          const homensStr = row[COLUNAS.HOMENS_INICIO + i].trim().replace(/[.,]/g, '');
          const homens = parseInt(homensStr, 10) || 0;
          
          // <-- MUDANÇA: Adiciona .trim() por segurança
          const mulheresStr = row[COLUNAS.MULHERES_INICIO + i].trim().replace(/[.,]/g, '');
          const mulheres = parseInt(mulheresStr, 10) || 0;

          if (faixa === "95–99") {
             continue; 
          }
          
          if (faixa === "100+") {
            const faixaAnterior = estado.piramide_local[estado.piramide_local.length - 1];
            faixaAnterior.faixa = "95+"; 
            faixaAnterior.homens += homens;   
            faixaAnterior.mulheres += mulheres; 
          } else {
             estado.piramide_local.push({ faixa, homens, mulheres });
          }
        }
        
        mapaEstados.set(nomeUfCsv, estado);
        
        // <-- MUDANÇA: Log de sucesso para este estado
        console.log(`[SUCESSO] Dados do estado ${nomeUfCsv} processados.`);
        estadosProcessados++;

      } else {
        // <-- MUDANÇA: Log para vermos o que está sendo ignorado
        if (nomeUfCsv && nomeUfCsv !== "Total") { // Ignora linhas vazias ou de "Total"
            console.warn(`[IGNORADO] Linha do CSV não encontrada no JSON: "${nomeUfCsv}"`);
            linhasIgnoradas++;
        }
      }
    }

    // --- Finalização ---
    console.log("\n--- Resumo do Processamento ---");
    console.log(`Total de estados processados: ${estadosProcessados}`);
    console.log(`Total de linhas ignoradas (Regiões, Brasil, etc.): ${linhasIgnoradas}`);

    if (estadosProcessados === 0) {
        console.error("\n❌ ERRO: Nenhum estado foi processado. Verifique os nomes das colunas e o 'slice(7)' no script.");
        return; // Não salva o arquivo se nada mudou
    }
    
    jsonData.por_estado = Array.from(mapaEstados.values());

    const outputPath = path.join(__dirname, 'data', 'autism-data-completo.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`\n🎉 Sucesso! Arquivo salvo em: ${outputPath}`);
    console.log("Não se esqueça de atualizar a rota 'dataviz.js' para carregar este novo arquivo.");

  } catch (error) {
    console.error('\n❌ Erro durante o processamento:', error.message);
  }
}

processarDados();