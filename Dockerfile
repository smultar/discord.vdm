FROM node:current-alpine

ARG DISCORD_SECRET
ARG IMAGE
ARG TAG
ARG BUILD

WORKDIR /usr/src/"${IMAGE}"
COPY . /usr/src/"${IMAGE}"

RUN npm ci --force --silent --only=production

LABEL com.centurylinklabs.watchtower.enable=true

ENTRYPOINT ["npm", "run", "start"]