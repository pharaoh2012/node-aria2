#
# Dockerfile for aria2
#

FROM alpine
MAINTAINER kev <noreply@datageek.info>

ENV TOKEN 00000000-0000-0000-0000-000000000000
ENV fs_browser_root /home/aria2

RUN apk add aria2 \
    apk add nodejs \
    && rm -rf /var/cache/apk/* 

RUN npm install -g pm2

COPY aria2.conf /etc/aria2/
COPY nodecode /nodecode
COPY start /start
RUN chmod 755 /start

VOLUME /home/aria2
EXPOSE 8080

CMD ["/start"]
