#
# Dockerfile for aria2
#

FROM alpine
MAINTAINER kev <noreply@datageek.info>

ENV TOKEN 00000000-0000-0000-0000-000000000000
ENV fs_browser_root /home/aria2

RUN set -xe \
	&& apk add -U aria2 \
    && apk add -U nodejs \
    && rm -rf /var/cache/apk/* 

RUN npm install -g pm2 && mkdir /nodecode

COPY aria2.conf /etc/aria2/
COPY nodecode /nodecode
COPY start /start
RUN chmod 755 /start && cd /nodecode && npm install

VOLUME /home/aria2 
EXPOSE 8080

CMD ["/start"]
