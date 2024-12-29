FROM public.ecr.aws/docker/library/node:20

WORKDIR /api-server

COPY . .

RUN npm install -g @nestjs/cli
RUN npm ci
RUN npm run build
RUN npx prisma generate

ENV APP_PORT=80

ENV DATABASE_URL="postgresql://nestrest2admin:mysecretpassword@localhost:5432/nestrest2test?schema=public"
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"

ENV AT_SECRET="3b9d32a8a94211eaa1a2c2a6c4f6a7b8"
ENV RT_SECRET="1a2b3c4d5e6f7081920a1b2c3d4e5f6a"
ENV TK_EMAIL_SECRET="abc123def456ghi789jkl012mno345pqr"
ENV TK_EMAIL_LIFETIME="1d"
ENV JWT_ACCESS_LIFETIME="1d"
ENV JWT_REFRESH_LIFETIME="1d"

# Encryption key needs to be 32 chars long
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

EXPOSE 80

RUN chmod +x /api-server/startProduction.sh
RUN chown root:root startProduction.sh

CMD /api-server/startProduction.sh