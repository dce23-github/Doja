FROM node:latest
WORKDIR /app
ENV NODE_ENV=production
COPY ["package.json", "package-lock.json*", "/app/"]
RUN npm install --production
COPY . .
RUN docker network create doja-net && docker network connect doja-net cont_web
CMD [ "node", "/app/app.js" ]
