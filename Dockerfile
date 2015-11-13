FROM node:4.2.2

RUN mkdir -p /src

WORKDIR /src

ADD . /src
#COPY . /usr/src/app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["npm start"]
