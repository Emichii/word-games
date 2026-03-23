FROM nginx:alpine
COPY word_games.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
