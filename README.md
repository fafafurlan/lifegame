# Ano a Ano

Simulador de vida em português, no estilo dos jogos "life sim": você nasce, envelhece um ano por vez e toma decisões que mudam sua história. Tem escola, vestibular, faculdade, carreiras, namoro, filhos, dinheiro, fama, saúde, crime e legado entre gerações, com situações do dia a dia brasileiro.

## Como jogar

Abra o `index.html` no navegador. Não precisa instalar nada. O progresso fica salvo no próprio navegador.

## Arquivos

- `index.html`: o jogo (interface, regras, carreiras, bens, conquistas).
- `eventos.js`: os eventos aleatórios. As instruções para criar eventos novos estão no topo do arquivo.
- `teste/sim.js`: simula centenas de vidas aleatórias para achar erros de lógica.

## Testar

```bash
node teste/sim.js . 300
```

O resultado mostra quantas vidas rodaram, quantos erros aconteceram e a distribuição das fitas de fim de vida.
