FROM node:10.16

COPY ./src /app/src/
COPY ./*.json /app/

WORKDIR /app/

RUN npm install
RUN npm run build

ENV PORT 8080
EXPOSE 8080
CMD npm start