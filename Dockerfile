FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

# Copia apenas o package.json e package-lock.json para instalar dependências
COPY package*.json ./

RUN npm ci

# Copia o restante do código após instalar dependências
COPY . .

RUN npm run build
RUN npx prisma generate

ARG DATABASE_URL
ENV SERVER_PORT=80
ENV DATABASE_URL=${DATABASE_URL}
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

EXPOSE 80

RUN chmod +x /app/startProduction.sh
RUN chown root:root startProduction.sh

CMD ["/app/startProduction.sh"]
