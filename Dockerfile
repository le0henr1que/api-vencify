FROM public.ecr.aws/docker/library/node:20

# Instalação de dependências básicas
# RUN apt update -y && \
#     apt upgrade -y && \
#     apt install -y curl \
#     libaio1 \
#     unzip \
#     git \
#     gnupg \
#     ca-certificates \
#     bash \
#     xz-utils \
#     libssl-dev 

# Configurar Node.js 20.17.0
# RUN curl -fsSL https://nodejs.org/dist/v20.17.0/node-v20.17.0-linux-x64.tar.xz | tar -xJC /usr/local --strip-components=1
# ENV PATH="/usr/local/node-v20.17.0-linux-x64/bin:${PATH}"

# Instalar Nest CLI globalmente
RUN npm install -g @nestjs/cli

WORKDIR /app
COPY dist/ ./dist
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY tsconfig.json ./tsconfig.json
COPY prisma/ ./prisma
COPY startProduction.sh ./startProduction.sh

# Instala as dependências usando npm
RUN npm ci --cache .npm --prefer-offline

# Executa o build
RUN npm run build

# Configuração de variáveis de ambiente
ARG DATABASE_URL
ENV SERVER_PORT=80
ENV DATABASE_URL=${DATABASE_URL}
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

EXPOSE 80

# Inicia o processo
RUN chmod +x /app/startProduction.sh
CMD ["/app/startProduction.sh"]