# Bem-vindo ao AutoCare! 👋
## 🛻 Seu veículo. Seu histórico. Seu controle.

</br><b><i>instruções de execução estão no final do README.md</i></br></br>

O AutoCare é um aplicativo híbrido desenvolvido para facilitar o gerenciamento de veículos e o acompanhamento de suas manutenções. A aplicação permite cadastrar veículos, registrar serviços realizados e manter um histórico organizado das informações, ajudando os proprietários a controlar os cuidados com seus automóveis.

O projeto foi desenvolvido como parte da Atividade de Sistematização da disciplina de Programação para Dispositivos Móveis (PDM), com foco em desenvolvimento multiplataforma, usabilidade, operações CRUD e persistência de dados.

# 📌 Problema e público-alvo
## 🔧 Problema identificado
Proprietários de veículos podem ter dificuldade para acompanhar as manutenções realizadas, recordar os serviços executados e organizar informações como quilometragem, datas e valores gastos.

A ausência de um histórico centralizado pode dificultar o planejamento das próximas manutenções e o controle dos custos de conservação do veículo.

### 🎯 Público-alvo

Proprietários de automóveis que desejam organizar seus veículos e manter um histórico de manutenções de maneira simples e acessível.

### ✅ Objetivo

Oferecer uma aplicação intuitiva que centralize os dados dos veículos e seus respectivos registros de manutenção, facilitando a consulta, a atualização e a organização dessas informações.

# ✨ Funcionalidades
## 🚘 Gerenciamento de veículos
O módulo de veículos permite:

- Cadastrar: adicionar veículos informando nome ou identificação, placa e quilometragem.
- Consultar: visualizar os veículos cadastrados.
- Editar: atualizar os dados de um veículo existente.
- Excluir: remover veículos cadastrados.
- Validação: verificar os dados preenchidos antes de salvar os registros.

## 🔧 Gerenciamento de manutenções

O módulo de manutenções permite:

- Cadastrar: registrar serviços realizados nos veículos.
- Consultar: visualizar o histórico de manutenções cadastradas.
- Vincular: associar cada manutenção a um veículo cadastrado.
- Editar: atualizar as informações de uma manutenção existente.
- Excluir: remover registros de manutenção.
- Registrar detalhes: informar serviço, data, quilometragem, valor e observações.
- Validar informações: verificar os campos obrigatórios e os formatos dos dados antes de salvar.

## 💾 Persistência de dados

O aplicativo utiliza o AsyncStorage para armazenar os registros localmente no dispositivo.

Os dados são mantidos entre sessões, permitindo que o usuário feche e abra novamente o aplicativo sem perder os registros salvos.

O armazenamento é realizado separadamente para veículos e manutenções.

O aplicativo salva os dados localmente no dispositivo, não foi utilizado um banco de dados em cloud para cross-plataform, devido à limitação de recursos nos planos gratuitos

## 📱 Aplicativo híbrido

O projeto utiliza React Native e Expo para compartilhar a base de código entre plataformas móveis.

A proposta é permitir a execução em Android e iOS a partir do mesmo projeto, reduzindo a necessidade de manter implementações independentes para cada sistema operacional.

# 🆗 Recursos Utilizados

| Tecnologia | Finalidade |
|---|---|
| React Native | Desenvolvimento da interface |
| Expo | Execução do aplicativo |
| TypeScript | Tipagem estática |
| AsyncStorage | Armazenamento local |

# 🗃️ Instruções para execução e testes
## Dentro do projeto zipado
- Abra a pasta do projeto no VSCode
- Abra o terminal e execute: npm install (baixar o Node.js ([clique aqui](https://nodejs.org/en/download)) caso ainda não possua)
- Após baixar as dependências, confira a versão do expo com npm list expo. (OBS: é necessário que a versão major [58] esteja no mesmo que a versão do Expo Go baixado no seu celular)

## No seu celular Android ou iOS
- Vá até [o site do expo](https://expo.dev/go)
- Em SDK Version, selecione a mesma que você baixou no projeto (no desenvolvimento do projeto foi utilizada a versão 58.0.0). Detalhe: se você atualizar a versão do expo no projeto pode quebrar dependências, então utilize a versão 58 do SDK.
- Baixe o aplicativo e aguarde a instalação

## No terminal do projeto
- Execute agora o projeto, com o comando: npx expo start --clear
- Abra o Expo Go
- O projeto rodará, e no terminal vai aparecer um QR Code, basta você escanear com o leitor do Expo Go (se os dois dispositivos estiverem conectados na mesma rede é provável que já aparecerá o projeto, mas por segurança escaneie o código)
- Dentro do celular, teste o aplicativo e as 4 operações

# 📞 Do suporte
O autor se coloca à disposição para eventuais erros, problemas, bugs ou suporte necessário sobre o aplicativo, por meio de mensagens no AVA ou pelo e-mail vitor.colombelli@sempreceub.com