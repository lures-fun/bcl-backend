# ビルド環境
FROM node:18-slim

WORKDIR /app
ENV LANG=C \
    TZ=Asia/Tokyo

## ビルド
COPY . /app

# aptパッケージアップデート
RUN apt-get update
# gitのインストール
RUN apt-get install git -y

RUN yarn cache clean
RUN yarn install

RUN npm run build

COPY ./entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

ARG PORT=3000
ENV PORT ${PORT}
EXPOSE $PORT

CMD ["node", "dist/src/main"]
