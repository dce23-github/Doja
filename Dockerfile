FROM node:latest
WORKDIR /app
ENV NODE_ENV=production
COPY ["package.json", "package-lock.json*", "/app/"]
RUN npm install --production
COPY . .
CMD [ "node", "/app/app.js" ]


FROM redis:latest

CMD ["redis-server"]
