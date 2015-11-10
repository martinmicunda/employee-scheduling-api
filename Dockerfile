FROM iojs:3.3.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["npm start"]
