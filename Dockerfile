FROM mhart/alpine-node:14.4.0

WORKDIR /usr/app/template

ENV NODE_ENV=production

ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start"]