FROM public.ecr.aws/docker/library/node:18


WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
RUN npx prisma generate

COPY prisma ./prisma
COPY . .

ARG DATABASE_URL
ENV SERVER_PORT=80
ENV DATABASE_URL=${DATABASE_URL}
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

EXPOSE 80

RUN chmod +x /api-server/startProduction.sh
RUN chown root:root startProduction.sh

CMD /api-server/startProduction.sh