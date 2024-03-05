Site - https://kamil-banaszek.pl/projekt

### DESCRIPTION
A simple website with server-side rendering content and a CMS (Content Management System for managing this content). The project showcases the capabilities of a RESTful API, creating and working with this API.

![image](https://github.com/Cr3ativeCod3r/SSR-with-CMS-site/assets/117399144/aa7ec6e0-dc46-4f9d-b580-1efb6e3926d0)


### FEATURES
- adding comments on the website
- content management system (CMS)
- dynamic content
- working with an API
- RESTful API

### TECHNOLOGIES
Just basic - project for university

Backend:
- Expressjs
- Nodejs
- Sql

Frontend:
- JavaScript
- EJS
- CSS (some bootstrap styling)

### DEPLOY

1. Rename to .env and complete
2. Intsallation
```bash
npm install
```
3. Start script
```bash
npm start
```
4. Optional if you are using Nginx
   

```bash
#Homepage:
location / {
        proxy_pass http://localhost:6000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
}

#CMS:
location /server/ {
        proxy_pass http://localhost:6000/server/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
}
```

