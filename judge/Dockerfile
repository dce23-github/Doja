FROM node:latest
WORKDIR /judge
ENV NODE_ENV=production
COPY ["package.json", "package-lock.json*", "/judge/"]
RUN npm install --production
COPY . .
RUN docker network connect doja-net cont_judge
CMD [ "node", "/judge/app.js" ]
