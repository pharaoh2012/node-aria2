#
# Dockerfile for aria2
#

FROM alpine
MAINTAINER kev <noreply@datageek.info>

ENV TOKEN 00000000-0000-0000-0000-000000000000

RUN set -xe \
    && apk add -U aria2 node \
    && rm -rf /var/cache/apk/* \
    && aria2c https://github.com/tianon/gosu/releases/download/1.7/gosu-amd64 -o /usr/local/bin/gosu \
    && chmod +x /usr/local/bin/gosu \
    && adduser -D aria2

RUN npm install -g pm2

COPY aria2.conf /etc/aria2/
COPY nodecode /nodecode
COPY start /start
RUN chmod 755 /start

VOLUME /home/aria2
EXPOSE 8080

CMD ["/start"]
