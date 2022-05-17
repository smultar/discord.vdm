# Node image
FROM node:current-alpine

# Copys the files from the current directory to the container
WORKDIR /usr/src/discord.vdm
COPY . /usr/src/discord.vdm

# Installs Git
RUN apk add --no-cache git

# Installs Node_Modules
ENTRYPOINT ["npm", "ci", "--force", "--silent"]