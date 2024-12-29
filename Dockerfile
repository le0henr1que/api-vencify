# Use a imagem base oficial do Node.js
FROM public.ecr.aws/docker/library/node:20

# Instalação global do Nest CLI
RUN npm install -g @nestjs/cli

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais para a instalação das dependências
COPY package.json package-lock.json tsconfig.json ./

# Copia os arquivos de Prisma e o script de inicialização
COPY prisma ./prisma
COPY startProduction.sh ./startProduction.sh

# Instala as dependências de forma limpa e eficiente
RUN npm ci --prefer-offline --no-audit --no-fund

# Executa o build do projeto
RUN npm run build

# COPY dist ./dist

# Configuração de variáveis de ambiente
ARG DATABASE_URL
ENV SERVER_PORT=80
ENV DATABASE_URL=${DATABASE_URL}
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

# Expondo a porta para acesso ao container
EXPOSE 80

# Garante que o script de inicialização seja executável
RUN chmod +x /app/startProduction.sh

# Define o comando de inicialização do container
CMD ["/app/startProduction.sh"]
