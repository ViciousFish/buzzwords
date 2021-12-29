FROM nginx:1.21

COPY ./dist /usr/share/nginx/html
COPY nginx.demo.conf /etc/nginx/conf.d/default.conf