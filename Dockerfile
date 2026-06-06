FROM nginx:alpine
COPY word_games.html /usr/share/nginx/html/index.html
COPY bingo-caller/ /usr/share/nginx/html/bingo-caller/
COPY price-is-right/ /usr/share/nginx/html/price-is-right/
COPY deal-or-no-deal/ /usr/share/nginx/html/deal-or-no-deal/
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
