FROM iojs:2.2.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["npm start"]
