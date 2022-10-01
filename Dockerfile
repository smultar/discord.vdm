FROM node:current

ARG DISCORD_SECRET
ARG IMAGE
ARG TAG
ARG BUILD

# TODO: this needs to be reworked so that state can be externalized with mounts, without replacing the contents of the installation itself!
WORKDIR /usr/src/"${IMAGE}"
COPY . /usr/src/"${IMAGE}"

RUN npm ci --force --silent --only=production

LABEL com.centurylinklabs.watchtower.enable=true

ENTRYPOINT ["npm", "run", "start"]